/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, limit, onSnapshot, doc, setDoc, deleteDoc, updateDoc, query, where, writeBatch, getDocs, getDoc, deleteField } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithCustomToken, signOut } from 'firebase/auth';
import { User, MenuItem, Ingredient, Order, SalesRecord, Table, OrderStatus, OrderItem, ClientInstance, AuditLog, Supplier, SupplyOrder, DEFAULT_PERMISSIONS, UserRole, TenantSettings } from '../types';
import { INITIAL_USERS, INITIAL_INGREDIENTS, INITIAL_MENU, INITIAL_TABLES, generateMockSalesHistory } from '../data/initialData';

interface RestaurantContextType {
  tenantSettings: TenantSettings;
  updateTenantSettings: (settings: Partial<TenantSettings>) => void;
  currentUser: User | null;
  users: User[];
  menu: MenuItem[];
  inventory: Ingredient[];
  orders: Order[];
  sales: SalesRecord[];
  tables: Table[];
  login: (username: string, password?: string, isSuperuserPortal?: boolean) => Promise<boolean>;
  logout: () => void;
  
  // Menu Management
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (item: MenuItem) => void;
  toggleMenuItemActive: (id: string) => void;
  deleteMenuItem: (id: string) => void;

  // Inventory Management
  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => void;
  updateIngredient: (ingredient: Ingredient) => void;
  deleteIngredient: (id: string) => void;
  restockIngredient: (id: string, amount: number) => void;

  // Order Operations
  createOrder: (tableNumber: number, items: Omit<OrderItem, 'id'>[], notes?: string) => { success: boolean; error?: string; orderId?: string };
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addItemsToOrder: (orderId: string, items: Omit<OrderItem, 'id'>[]) => { success: boolean; error?: string };
  
  // Bill Closing
  closeBill: (orderId: string, paymentMethod: 'cash' | 'card' | 'pix' | 'digital', finalAmountOverride?: number) => void;
  // Supply Management
  suppliers: Supplier[];
  supplyOrders: SupplyOrder[];
  addSupplier: (s: Supplier) => void;
  addSupplyOrder: (o: SupplyOrder) => void;
  updateSupplyOrderStatus: (orderId: string, status: 'Pendente' | 'Recebido') => void;
  syncAndCleanOrphans: () => void;

  // Helper Stock Checker
  checkMenuItemStock: (menuItemId: string, quantity: number) => { available: boolean; limitingIngredient?: string };

  // User Management
  registerUser: (user: Omit<User, 'id'>) => Promise<{ success: boolean; error?: string }>;
  updateUserPermissions: (userId: string, permissions: string[]) => void;
  deleteUser: (userId: string) => void;

  // System Master Dashboard Properties
  clientInstances: ClientInstance[];
  auditLogs: AuditLog[];
  addClientInstance: (client: Omit<ClientInstance, 'id' | 'createdAt' | 'activeOrdersCount' | 'monthlyRevenue' | 'databaseSizeMB'>) => void;
  updateClientSubscription: (clientId: string, tier: ClientInstance['subscriptionTier'], status: ClientInstance['subscriptionStatus'], cost: number, nextBillingDate: string) => void;
  deleteClientInstance: (clientId: string) => void;
  addAuditLog: (action: string, details: string, explicitTenantId?: string) => void;
  
  // Navigation View State
  currentView: string;
  setView: (view: string) => void;
}


// Client-side SHA-256 for basic password hashing fallback
const hashPassword = async (password: string) => {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);


const sanitizeInventory = (inv: any[]) => {
  if (!Array.isArray(inv)) return [];
  return inv.map(i => {
    if (!i.id) {
      return { ...i, id: `temp-${i.name}` };
    }
    return i;
  });
};

const sanitizeUsers = (users: any[]) => {
  if (!Array.isArray(users)) return [];
  return users.map(u => {
    if (!u.permissions) {
      return { ...u, permissions: DEFAULT_PERMISSIONS[u.role as UserRole] || [] };
    }
    return u;
  });
};


// Helper to recursively remove undefined fields so Firestore doesn't complain
const cleanUndefined = (obj: any): any => {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(cleanUndefined);
  const newObj: any = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      newObj[key] = cleanUndefined(obj[key]);
    }
  }
  return newObj;
};

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation View State
  const [currentView, setView] = useState('dashboard');

  // Authentication State
  // Always initialize to null upon launch to force redirect to the login page
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [hasLoadedTenantData, setHasLoadedTenantData] = useState(false);

  // Restore Firebase Auth session on page reload
  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser && !currentUser) {
        try {
          let foundUser = null;
          const userDocSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDocSnap.exists()) {
            foundUser = userDocSnap.data();
          } else {
            const usersSnap = await getDocs(collection(db, 'users'));
            usersSnap.forEach(doc => {
              const data = doc.data();
              if (data.email && data.email.toLowerCase() === firebaseUser.email?.toLowerCase()) {
                foundUser = data;
              }
            });
          }
          if (foundUser) {
            setCurrentUser(sanitizeUsers([foundUser])[0]);
          } else if (firebaseUser.email === 'nick31.n3@gmail.com' || firebaseUser.email === 'nick31.N3@gmail.com') {
            setCurrentUser({
                id: 'u-nick31-superuser',
                username: 'nick31',
                name: 'Nick User (Superuser)',
                role: 'superuser',
                email: 'nick31.N3@gmail.com',
                permissions: ['master_dashboard', 'dashboard', 'reports', 'menu', 'inventory', 'supplies', 'waiter', 'kitchen', 'billing', 'employees', 'settings', 'audit']
            } as any);
          }
        } catch(e) {
          console.error("Error restoring session:", e);
        }
      }
    });
    return () => unsubAuth();
  }, [currentUser]);

  // Clean slate removed

  // Auto-route on role switch to prevent unauthorized views or broken layouts
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'waiter') {
        setView('waiter');
      } else if (currentUser.role === 'cook') {
        setView('kitchen');
      } else if (currentUser.role === 'manager' || currentUser.role === 'admin') {
        setView('employees');
      } else {
        setView('dashboard');
      }
    }
  }, [currentUser]);

  const [users, setUsers] = useState<User[]>(INITIAL_USERS);

  // Menu State
  const [menu, setMenu] = useState<MenuItem[]>(INITIAL_MENU);

  // Inventory State
  const [inventory, setInventory] = useState<Ingredient[]>(INITIAL_INGREDIENTS);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);

  // Tables State
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplyOrders, setSupplyOrders] = useState<SupplyOrder[]>([]);
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);

  // Sales History State
  const [sales, setSales] = useState<SalesRecord[]>([]);

  // System Master Dashboard States
  const [clientInstances, setClientInstances] = useState<ClientInstance[]>([]);  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [tenantSettings, setTenantSettings] = useState<TenantSettings>({
    id: 'global',
    restaurantName: 'MM Systems',
    receiptMessage: 'Obrigado pela preferência!'
  });

  // Real-time Firestore Listeners
  useEffect(() => {
    if (!currentUser) {
      setHasLoadedTenantData(false);
      return;
    }
    const tenantId = currentUser.tenantId || 'global';
    const isSuperuser = currentUser.role === 'superuser' || currentUser.username.trim().toLowerCase() === 'nick31' || currentUser.username.trim().toLowerCase() === 'nick31.n3@gmail.com';
    
    const getQuery = (collName: string, maxLimit?: number) => {
      let baseQ = isSuperuser ? collection(db, collName) as any : query(collection(db, collName), where('tenantId', '==', tenantId));
      if (maxLimit) {
        return query(baseQ, limit(maxLimit));
      }
      return baseQ;
    };

    const unsubMenu = onSnapshot(getQuery('menu'), (snap) => setMenu(snap.docs.map(d => d.data() as MenuItem)));
    const unsubInv = onSnapshot(getQuery('inventory'), (snap) => setInventory(sanitizeInventory(snap.docs.map(d => d.data() as Ingredient))));
    const unsubOrders = onSnapshot(getQuery('orders'), (snap) => setOrders(snap.docs.map(d => d.data() as Order)));
    const unsubSales = onSnapshot(getQuery('sales'), (snap) => setSales(snap.docs.map(d => d.data() as SalesRecord)));
    
    const unsubTenantSettings = onSnapshot(doc(db, 'tenantSettings', tenantId), (docSnap) => {
      if (docSnap.exists()) {
        setTenantSettings(docSnap.data() as TenantSettings);
      } else {
        setTenantSettings({
          id: tenantId,
          restaurantName: 'MM Systems',
          receiptMessage: 'Obrigado pela preferência!'
        });
      }
    });

    const unsubTables = onSnapshot(getQuery('tables'), (snap) => {
      const fetchedTables = snap.docs.map(d => d.data() as Table);
      const mergedTables = INITIAL_TABLES.map(initialTable => {
        const found = fetchedTables.find(t => t.number === initialTable.number);
        return found || initialTable;
      });
      setTables(mergedTables);
    });
    const unsubUsers = onSnapshot(getQuery('users'), (snap) => {
      let loadedUsers = snap.docs.map(d => d.data() as User);
      if (!loadedUsers.some((u) => u.id === currentUser.id)) {
        loadedUsers = [currentUser, ...loadedUsers];
      }
      setUsers(sanitizeUsers(loadedUsers));
    });
    const unsubSuppliers = onSnapshot(getQuery('suppliers'), (snap) => setSuppliers(snap.docs.map(d => d.data() as Supplier)));
    const unsubSupplyOrders = onSnapshot(getQuery('supplyOrders', 100), (snap) => setSupplyOrders(snap.docs.map(d => d.data() as SupplyOrder)));
    const unsubClients = isSuperuser 
      ? onSnapshot(collection(db, 'clientInstances'), (snap) => setClientInstances(snap.docs.map(d => d.data() as ClientInstance)))
      : () => {};
    const unsubAudit = onSnapshot(getQuery('auditLogs', 50), (snap) => setAuditLogs(snap.docs.map(d => d.data() as AuditLog)));
    setHasLoadedTenantData(true);
    
    return () => {
      unsubTenantSettings();
      unsubMenu(); unsubInv(); unsubOrders(); unsubSales(); unsubTables();
      unsubUsers(); unsubSuppliers(); unsubSupplyOrders(); unsubClients(); unsubAudit();
    };
  }, [currentUser]);

  // Supply Management
  const addSupplier = async (s: Supplier) => { await setDoc(doc(db, 'suppliers', s.id), { ...s, tenantId: currentUser?.tenantId || 'global' }); };
  const addSupplyOrder = async (o: SupplyOrder) => { await setDoc(doc(db, 'supplyOrders', o.id), { ...o, tenantId: currentUser?.tenantId || 'global' }); };
  const updateSupplyOrderStatus = async (orderId: string, status: 'Pendente' | 'Recebido') => {
    await updateDoc(doc(db, 'supplyOrders', orderId), { status });
  };

  const syncAndCleanOrphans = () => {
    const batch = writeBatch(db);
    tables.forEach(t => {
      if (t.status === 'occupied') {
        const activeOrderForTable = orders.find(o => o.tableNumber === t.number && o.status !== 'closed');
        if (!activeOrderForTable) {
          batch.set(doc(db, 'tables', t.id || t.number.toString()), { ...t, status: 'available', currentOrderId: deleteField() }, { merge: true });
        } else if (t.currentOrderId !== activeOrderForTable.id) {
          batch.set(doc(db, 'tables', t.id || t.number.toString()), { ...t, currentOrderId: activeOrderForTable.id }, { merge: true });
        }
      }
    });
    orders.forEach(o => {
      if (o.status !== 'closed') {
        const tableExists = tables.find(t => t.number === o.tableNumber);
        if (!tableExists) {
          batch.update(doc(db, 'orders', o.id), cleanUndefined({ status: 'closed' }));
        }
      }
    });
    batch.commit().catch(console.error);
  };

  // Auth Functions
  const login = async (username: string, password?: string, isSuperuserPortal = false): Promise<boolean> => {
    let loginEmail = username.trim();

    if (!password) return false;
    password = password.trim();

    // Fast path: Server-Side Authentication
    let serverUser = null;
    let serverCustomToken = null;
    try {
      const authRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, isSuperuserPortal })
      });
      if (authRes.ok) {
        const resData = await authRes.json();
        if (resData.success && resData.user) {
          serverUser = resData.user;
          if (resData.customToken) {
            serverCustomToken = resData.customToken;
          }
        }
      }
    } catch (err) {
      console.warn("Server auth endpoint unreachable:", err);
    }

    if (serverUser) {
      loginEmail = serverUser.email || loginEmail;
    }

    // Authenticate with Firebase Auth so that Firestore rules allow read/write
    if (!loginEmail.includes('@')) {
      // Check local users first
      const localUser = users.find(u => u.username.toLowerCase() === loginEmail.toLowerCase());
      if (localUser && localUser.email) {
        loginEmail = localUser.email;
      } else {
        try {
          const q = query(collection(db, 'users'), where('username', '==', loginEmail.toLowerCase()));
          const snap = await getDocs(q);
          if (!snap.empty) {
            loginEmail = snap.docs[0].data().email || loginEmail;
          }
        } catch(e) {
          console.warn("Firestore email lookup failed:", e);
        }
      }
    }

    let firebaseUserObj = null;
    if (serverCustomToken) {
      try {
        await signInWithCustomToken(auth, serverCustomToken);
        firebaseUserObj = serverUser;
      } catch (e) {
        console.warn("Failed to sign in with custom token", e);
      }
    } else if (loginEmail.includes('@')) {
      try {
        await signInWithEmailAndPassword(auth, loginEmail, password);
        let foundUser = users.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());
        
        if (!foundUser) {
           const q = query(collection(db, 'users'), where('email', '==', loginEmail));
           const snap = await getDocs(q);
           if (!snap.empty) foundUser = snap.docs[0].data() as User;
        }
        firebaseUserObj = foundUser;
      } catch (e: any) {
        console.warn("Firebase auth login failed:", e);
      }
    }

    // Determine the final user to log in with
    let finalUser = firebaseUserObj || serverUser;
    
    // Offline / Local DB Fallback (if server custom auth and Firebase auth both failed)
    if (!finalUser) {
      const localFallbackUser = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
      const hashedPass = await hashPassword(password);
      if (localFallbackUser && (localFallbackUser.password === password || localFallbackUser.password === hashedPass)) {
         finalUser = localFallbackUser;
      } else {
         try {
           const { query, collection, where, getDocs } = await import('firebase/firestore');
           let q = query(collection(db, 'users'), where('username', '==', username.trim().toLowerCase()));
           let qExact = query(collection(db, 'users'), where('username', '==', username.trim()));
           if (username.includes('@')) {
               q = query(collection(db, 'users'), where('email', '==', username.trim().toLowerCase()));
           }
           let snap = await getDocs(qExact);
           if (snap.empty) snap = await getDocs(q);
           if (!snap.empty) {
               const docUser = snap.docs[0].data();
               const hashedInput = await hashPassword(password);
               // Allow legacy plaintext match (for migration) or hashed match
               if (docUser.password === password || docUser.password === hashedInput) {
                   finalUser = docUser;
                   // Self-heal: If password was stored in plaintext, upgrade it to hashed
                   if (docUser.password === password) {
                       try {
                           const { doc, updateDoc } = await import('firebase/firestore');
                           await updateDoc(doc(db, 'users', docUser.id), { password: hashedInput });
                       } catch(err) {
                           console.warn("Could not upgrade password hash", err);
                       }
                   }
               }
           }
         } catch(e) {
           console.warn("Firestore fallback login failed", e);
         }
      }
    }

    if (finalUser) {
      if (finalUser.role === 'superuser' && !isSuperuserPortal) {
        if (auth.currentUser) await signOut(auth);
        return false;
      }
      const sanitizedUser = sanitizeUsers([finalUser])[0];
      setCurrentUser(sanitizedUser);
      return true;
    }

    // Final Fallback: Offline / Hardcoded Superuser
    if ((username.trim().toLowerCase() === 'nick31' || username.trim().toLowerCase() === 'nick31.n3@gmail.com') && password === 'password') {
      if (!isSuperuserPortal) { return false; }
      const sUser: User = {
        id: 'u-nick31-superuser',
        username: 'nick31',
        name: 'Nick User (Superuser)',
        role: 'superuser',
        email: 'nick31.N3@gmail.com',
        permissions: ['master_dashboard', 'dashboard', 'reports', 'menu', 'inventory', 'supplies', 'waiter', 'kitchen', 'billing', 'employees', 'settings', 'audit']
      };
      setCurrentUser(sUser);
      return true;
    }
    
    return false;
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch(e) {
      console.error(e);
    }
    setCurrentUser(null);
    setMenu([]);
    setInventory([]);
    setOrders([]);
    setSales([]);
    setTables(INITIAL_TABLES);
    setUsers(INITIAL_USERS);
    setHasLoadedTenantData(false);
  };

  // Master Dashboard Action Methods
  const addAuditLog = (action: string, details: string, explicitTenantId?: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      actor: currentUser ? currentUser.username : 'system',
      action,
      ipAddress: '192.168.1.100',
      details,
      tenantId: explicitTenantId || currentUser?.tenantId || 'global'
    };
    setDoc(doc(db, 'auditLogs', newLog.id), cleanUndefined(newLog)).catch(console.error);
  };

  const addClientInstance = async (client: Omit<ClientInstance, 'id' | 'createdAt' | 'activeOrdersCount' | 'monthlyRevenue' | 'databaseSizeMB'>) => {
    // Check for duplicate logins
    const proposedUsername = client.adminUsername ? client.adminUsername.trim().toLowerCase() : client.email.split('@')[0].toLowerCase();
    const proposedEmail = client.email.toLowerCase();
    
    const duplicateUser = users.find(u => 
      u.username.toLowerCase() === proposedUsername || 
      (u.email && u.email.toLowerCase() === proposedEmail)
    );
    
    if (duplicateUser) {
      // removed alert
      throw new Error("A user with this username or email already exists.");
    }
    const safeClient = { ...client };
    delete safeClient.adminPassword;

    const newClient: ClientInstance = {
      ...safeClient,
      id: `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      activeOrdersCount: 0,
      monthlyRevenue: 0.0,
      databaseSizeMB: 4.8,
      createdAt: new Date().toISOString()
    };
    setClientInstances(prev => [...prev, newClient]);
    await setDoc(doc(db, 'clientInstances', newClient.id), cleanUndefined(newClient)).catch(console.error);
    addAuditLog('CLIENT_CREATED', `New tenant instance created: "${client.name}" (${client.ownerName}). DB Host: ${client.dbHost}`, newClient.id);

    // Create corresponding user so they can log in
    if (client.email && client.adminPassword) {
      try {
        let uid = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
        try {
          const { initializeApp } = await import('firebase/app');
          const { getAuth: getSecondaryAuth } = await import('firebase/auth');
          const firebaseConfig = {
            apiKey: "AIzaSyD1Wn3crPIzD7Lnj-ok1K17nOVA2D7VlLM",
            authDomain: "mm-systems-502601.firebaseapp.com",
            projectId: "mm-systems-502601",
            storageBucket: "mm-systems-502601.firebasestorage.app",
            messagingSenderId: "710608157926",
            appId: "1:710608157926:web:d1d694325b3936e2890f27"
          };
          const secondaryApp = initializeApp(firebaseConfig, 'SecondaryApp-' + Date.now());
          const secondaryAuth = getSecondaryAuth(secondaryApp);
          const userCredential = await createUserWithEmailAndPassword(secondaryAuth, client.email, client.adminPassword);
          await secondaryAuth.signOut();
          uid = userCredential.user.uid;
        } catch (e) {
          console.warn("Firebase Auth user creation disabled or failed, falling back to local DB auth", e);
        }

        const newUser: User = {
          id: uid,
          username: client.adminUsername ? client.adminUsername.trim().toLowerCase() : client.email.split('@')[0].toLowerCase(),
          password: client.adminPassword ? await hashPassword(client.adminPassword) : undefined,
          name: client.ownerName,
          role: 'admin',
          email: client.email,
          permissions: ['dashboard', 'reports', 'menu', 'inventory', 'supplies', 'waiter', 'kitchen', 'billing', 'employees', 'settings', 'audit'],
          tenantId: newClient.id
        };
        await setDoc(doc(db, 'users', newUser.id), cleanUndefined(newUser));
      } catch (error) {
        console.error("Error creating user doc:", error);
      }
    }
  };

  const updateClientSubscription = (
    clientId: string,
    tier: ClientInstance['subscriptionTier'],
    status: ClientInstance['subscriptionStatus'],
    cost: number
  ) => {
    setClientInstances(prev => prev.map(c => {
      if (c.id === clientId) {
        const details = `Subscription changed to ${tier} (${status}) - R$ ${cost.toFixed(2)}`;
        addAuditLog('CLIENT_SUBSCRIPTION_UPDATED', `Client "${c.name}" ${details}`, clientId);
        let nextBillingDate = c.nextBillingDate;
        if (status === 'active' && (!c.nextBillingDate || new Date(c.nextBillingDate) <= new Date())) {
          const nextMonth = new Date();
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          nextBillingDate = nextMonth.toISOString();
        }
        updateDoc(doc(db, 'clientInstances', clientId), {
          subscriptionTier: tier,
          subscriptionStatus: status,
          subscriptionCost: cost,
          nextBillingDate
        }).catch(console.error);
      }
      return c;
    }));
  };

  const deleteClientInstance = (clientId: string) => {
    const client = clientInstances.find(c => c.id === clientId);
    if (client) {
      setClientInstances(prev => prev.filter(c => c.id !== clientId));
      deleteDoc(doc(db, 'clientInstances', clientId)).catch(console.error);
      
      // Delete all users belonging to this tenant
      users.filter(u => u.tenantId === clientId).forEach(u => {
        deleteDoc(doc(db, 'users', u.id)).catch(console.error);
      });
      
      addAuditLog('CLIENT_DELETED', `Tenant instance completely purged: "${client.name}" (${client.ownerName}).`, client.id);
    }
  };

  // User Management
  const registerUser = async (user: Omit<User, 'id'>) => {
    // Check locally first
    const existsLocally = users.some(u => u.username.toLowerCase() === user.username.trim().toLowerCase());
    if (existsLocally) {
      return { success: false, error: 'Este nome de usuário já está cadastrado nesta instância.' };
    }
    
    // Check globally to prevent login conflicts
    try {
      const q = query(collection(db, 'users'), where('username', '==', user.username.trim().toLowerCase()));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return { success: false, error: 'Este nome de usuário já está sendo utilizado globalmente. Escolha outro.' };
      }
      if (user.email) {
        const qEmail = query(collection(db, 'users'), where('email', '==', user.email.trim().toLowerCase()));
        const snapEmail = await getDocs(qEmail);
        if (!snapEmail.empty) {
          return { success: false, error: 'Este email já está sendo utilizado globalmente. Escolha outro.' };
        }
      }
    } catch(e) {
      console.warn("Global duplication check failed (might be permissions), continuing...", e);
    }


    // Restrict superuser roles exclusively to the current user profile (nick31 with email nick31.N3@gmail.com)
    if (user.role === 'superuser' && user.email !== 'nick31.N3@gmail.com') {
      return { 
        success: false, 
        error: 'Acesso Superusuario restrito exclusivamente ao perfil nick31.N3@gmail.com.' 
      };
    }

    // Default permissions based on role
    let permissions: string[] = [];
    if (user.role === 'admin') {
      permissions = ['dashboard', 'reports', 'menu', 'inventory', 'supplies', 'waiter', 'kitchen', 'billing', 'employees', 'settings', 'audit'];
    } else if (user.role === 'manager') {
      permissions = ['dashboard', 'reports', 'menu', 'inventory', 'supplies', 'waiter', 'kitchen', 'billing', 'employees', 'settings', 'audit'];
    } else if (user.role === 'waiter') {
      permissions = ['waiter', 'menu', 'billing'];
    } else if (user.role === 'cook') {
      permissions = ['kitchen', 'inventory'];
    }

    let uid = `u-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    if (user.email && user.password) {
      try {
        const { initializeApp } = await import('firebase/app');
        const { getAuth: getSecondaryAuth, createUserWithEmailAndPassword } = await import('firebase/auth');
        const firebaseConfig = {
          apiKey: "AIzaSyD1Wn3crPIzD7Lnj-ok1K17nOVA2D7VlLM",
          authDomain: "mm-systems-502601.firebaseapp.com",
          projectId: "mm-systems-502601",
          storageBucket: "mm-systems-502601.firebasestorage.app",
          messagingSenderId: "710608157926",
          appId: "1:710608157926:web:d1d694325b3936e2890f27"
        };
        const secondaryApp = initializeApp(firebaseConfig, 'SecondaryAppRegisterUser-' + Date.now());
        const secondaryAuth = getSecondaryAuth(secondaryApp);
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, user.email, user.password);
        await secondaryAuth.signOut();
        uid = userCredential.user.uid;
      } catch (e) {
        console.warn("Firebase Auth user creation disabled or failed for employee, falling back to local DB auth", e);
      }
    }

    const newUser: User = {
      ...user,
      id: uid,
      password: user.password ? await hashPassword(user.password) : undefined,
      permissions: user.permissions || permissions,
      tenantId: currentUser?.tenantId || 'global'
    };
    await setDoc(doc(db, 'users', newUser.id), cleanUndefined(newUser));
    addAuditLog('USER_CREATED', `Novo colaborador cadastrado: ${user.name} (${user.role})`);
    return { success: true };
  };

  const updateUserPermissions = (userId: string, permissions: string[]) => {
    updateDoc(doc(db, 'users', userId), { permissions }).catch(console.error);
    addAuditLog('PERMISSIONS_UPDATED', `Permissões de acesso atualizadas para o usuário ID: ${userId}`);
    // If current user, update their session too
    setCurrentUser(prev => {
      if (prev && prev.id === userId) {
        return { ...prev, permissions };
      }
      return prev;
    });
  };

  const deleteUser = (userId: string) => {
    deleteDoc(doc(db, 'users', userId)).catch(console.error);
    addAuditLog('USER_DELETED', `Conta de colaborador revogada e excluída: ID ${userId}`);
  };

  // Menu Management
  const addMenuItem = async (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: `menu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId: currentUser?.tenantId || 'global'
    } as any;
    await setDoc(doc(db, 'menu', newItem.id), cleanUndefined(newItem));
    addAuditLog('MENU_ITEM_ADDED', `Novo item adicionado ao cardápio: ${item.name}`);
  };

  const updateMenuItem = async (item: MenuItem) => {
    await updateDoc(doc(db, 'menu', item.id), cleanUndefined(item));
    addAuditLog('MENU_ITEM_UPDATED', `Item do cardápio atualizado: ${item.name}`);
  };

  const toggleMenuItemActive = async (id: string) => {
    const item = menu.find(m => m.id === id);
    if (item) {
      await updateDoc(doc(db, 'menu', id), { isActive: !item.isActive });
    }
  };

  const deleteMenuItem = async (id: string) => {
    await deleteDoc(doc(db, 'menu', id));
    addAuditLog('MENU_ITEM_DELETED', `Item removido do cardápio: ID ${id}`);
  };

  // Inventory Management
  const addIngredient = async (ingredient: Omit<Ingredient, 'id'>) => {
    const newIng = {
      ...ingredient,
      id: `ing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId: currentUser?.tenantId || 'global'
    };
    await setDoc(doc(db, 'inventory', newIng.id), cleanUndefined(newIng));
  };

  const updateIngredient = async (ingredient: Ingredient) => {
    await updateDoc(doc(db, 'inventory', ingredient.id), cleanUndefined(ingredient));
  };

  const deleteIngredient = async (id: string) => {
    await deleteDoc(doc(db, 'inventory', id));
    // Remove ingredient from recipes
    const batch = writeBatch(db);
    menu.forEach(m => {
      if (m.ingredients.some(recipe => recipe.ingredientId === id)) {
        batch.update(doc(db, 'menu', m.id), {
          ingredients: m.ingredients.filter(recipe => recipe.ingredientId !== id)
        });
      }
    });
    await batch.commit();
  };

  const restockIngredient = async (id: string, amount: number) => {
    const ingredient = inventory.find(i => i.id === id);
    if (ingredient) {
      await updateDoc(doc(db, 'inventory', id), { quantity: Number((ingredient.quantity + amount).toFixed(2)) });
    }
  };

  // Helper to check if a menu item has enough ingredient stock for a specific quantity
  const checkMenuItemStock = (menuItemId: string, quantity: number): { available: boolean; limitingIngredient?: string } => {
    const menuItem = menu.find(m => m.id === menuItemId);
    if (!menuItem) return { available: false };
    if (!menuItem.isActive) return { available: false, limitingIngredient: 'Item Disabled' };

    for (const recipe of menuItem.ingredients) {
      const ingredient = inventory.find(i => i.id === recipe.ingredientId);
      if (!ingredient) {
        return { available: false, limitingIngredient: 'Missing Ingredient info' };
      }
      const totalNeeded = recipe.quantityNeeded * quantity;
      if (ingredient.quantity < totalNeeded) {
        return { available: false, limitingIngredient: ingredient.name };
      }
    }

    return { available: true };
  };

  // Helper to deduct ingredients for order items
  const deductIngredientsForItems = (items: Omit<OrderItem, 'id'>[] | OrderItem[], currentInv: Ingredient[]): { success: boolean; updatedInventory?: Ingredient[]; error?: string } => {
    const updated = [...currentInv];
    
    // Aggregate all required ingredients across all items
    const requiredIngredients: { [ingredientId: string]: number } = {};

    for (const item of items) {
      const menuItem = menu.find(m => m.id === item.menuItemId);
      if (!menuItem) continue;

      for (const recipe of menuItem.ingredients) {
        const needed = recipe.quantityNeeded * item.quantity;
        requiredIngredients[recipe.ingredientId] = (requiredIngredients[recipe.ingredientId] || 0) + needed;
      }
    }

    // Verify all ingredients are in stock
    for (const [ingId, qtyNeeded] of Object.entries(requiredIngredients)) {
      const idx = updated.findIndex(i => i.id === ingId);
      if (idx === -1) {
        return { success: false, error: 'Ingredient not found in database' };
      }
      if (updated[idx].quantity < qtyNeeded) {
        return { success: false, error: `Insufficient stock for ${updated[idx].name}` };
      }
      // Deduct
      updated[idx] = {
        ...updated[idx],
        quantity: Number((updated[idx].quantity - qtyNeeded).toFixed(4))
      };
    }

    return { success: true, updatedInventory: updated };
  };

  // Order Operations
  const createOrder = (tableNumber: number, items: Omit<OrderItem, 'id'>[], notes?: string) => {
    if (items.length === 0) {
      return { success: false, error: 'Cannot create an empty order' };
    }

    // Verify stock and deduct
    const deductionResult = deductIngredientsForItems(items, inventory);
    if (!deductionResult.success || !deductionResult.updatedInventory) {
      return { success: false, error: deductionResult.error };
    }

    const orderId = `ord-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Determine if this order only contains beverages
    const hasNonBeverage = items.some(item => {
      const menuItem = menu.find(m => m.id === item.menuItemId);
      return menuItem && menuItem.category !== 'Beverages';
    });

    const newOrder: Order = {
      id: orderId,
      tableNumber,
      waiterId: currentUser?.id || 'sys',
      waiterName: currentUser?.name || 'System',
      items: items.map((item, idx) => ({ ...item, id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${idx}` })),
      status: hasNonBeverage ? 'pending' : 'served',
      totalAmount: Number(totalAmount.toFixed(2)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...(notes ? { notes } : {}),
    };

    const batch = writeBatch(db);
    deductionResult.updatedInventory.forEach(inv => {
      batch.set(doc(db, 'inventory', inv.id), inv);
    });
    batch.set(doc(db, 'orders', newOrder.id), cleanUndefined({ ...newOrder, tenantId: currentUser?.tenantId || 'global' }));
    const table = tables.find(t => t.number === tableNumber);
    if (table) batch.set(doc(db, 'tables', table.id || table.number.toString()), { ...table, status: 'occupied', currentOrderId: orderId, tenantId: currentUser?.tenantId || 'global' }, { merge: true });
    batch.commit().catch(console.error);

    addAuditLog("ORDER_CREATED", `Novo pedido aberto para Mesa ${tableNumber}. Valor inicial: R$ ${totalAmount.toFixed(2)}`);
    return { success: true, orderId };
  };

  const addItemsToOrder = (orderId: string, items: Omit<OrderItem, 'id'>[]) => {
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return { success: false, error: 'Order not found' };

    const order = orders[orderIndex];
    if (order.status === 'closed') return { success: false, error: 'Cannot modify a closed order' };

    // Deduct stock
    const deductionResult = deductIngredientsForItems(items, inventory);
    if (!deductionResult.success || !deductionResult.updatedInventory) {
      return { success: false, error: deductionResult.error };
    }

    // Create unique IDs for new items, or combine if matching item with same notes
    const updatedItems = [...order.items];
    items.forEach((newItem, idx) => {
      const matchIndex = updatedItems.findIndex(i => i.menuItemId === newItem.menuItemId && i.notes === newItem.notes);
      if (matchIndex !== -1) {
        updatedItems[matchIndex] = {
          ...updatedItems[matchIndex],
          quantity: updatedItems[matchIndex].quantity + newItem.quantity,
        };
      } else {
        updatedItems.push({
          ...newItem,
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-add-${idx}`,
        });
      }
    });

    const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const batch = writeBatch(db);
    deductionResult.updatedInventory.forEach(inv => {
      batch.update(doc(db, 'inventory', inv.id), { quantity: inv.quantity });
    });
    const hasNewNonBeverage = items.some(item => {
      const menuItem = menu.find(m => m.id === item.menuItemId);
      return menuItem && menuItem.category !== 'Beverages';
    });
    batch.update(doc(db, 'orders', orderId), cleanUndefined({
      items: updatedItems,
      totalAmount: Number(newTotal.toFixed(2)),
      status: hasNewNonBeverage ? 'pending' : order.status,
      updatedAt: new Date().toISOString()
    }));
    batch.commit().catch(console.error);

    addAuditLog("ORDER_UPDATED", `Atualização no pedido.`);
    return { success: true };
  };


  const updateTenantSettings = (settings: Partial<TenantSettings>) => {
    if (!currentUser) return;
    const tenantId = currentUser.tenantId || 'global';
    setDoc(doc(db, 'tenantSettings', tenantId), { ...tenantSettings, ...settings, id: tenantId }, { merge: true }).catch(console.error);
    addAuditLog('TENANT_SETTINGS_UPDATED', `Configurações do cliente atualizadas`);
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await updateDoc(doc(db, 'orders', orderId), cleanUndefined({ status, updatedAt: new Date().toISOString() }));
  };

  // Bill Closing
  const closeBill = (orderId: string, paymentMethod: 'cash' | 'card' | 'pix' | 'digital', finalAmountOverride?: number) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || order.status === 'closed') return;

    // Calculate total cost price of ingredients used in this order to determine profitability
    let orderCost = 0;
    order.items.forEach(item => {
      const menuItem = menu.find(m => m.id === item.menuItemId);
      if (menuItem) {
        let itemCost = 0;
        menuItem.ingredients.forEach(recipe => {
          const ingredient = inventory.find(i => i.id === recipe.ingredientId);
          if (ingredient) {
            itemCost += ingredient.costPrice * recipe.quantityNeeded;
          }
        });
        orderCost += (itemCost > 0 ? itemCost : menuItem.price * 0.35) * item.quantity;
      }
    });

    const itemsCount = order.items.reduce((acc, item) => acc + item.quantity, 0);
    const finalTotalAmount = finalAmountOverride !== undefined ? finalAmountOverride : order.totalAmount;
    const profitAmount = finalTotalAmount - orderCost;

    const newSalesRecord: SalesRecord = {
      id: `sale-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      orderId: order.id,
      tableNumber: order.tableNumber,
      itemsCount,
      totalAmount: Number(finalTotalAmount.toFixed(2)),
      costAmount: Number(orderCost.toFixed(2)),
      profitAmount: Number(profitAmount.toFixed(2)),
      paymentMethod,
      timestamp: new Date().toISOString(),
    };

    const batch = writeBatch(db);
    batch.update(doc(db, 'orders', orderId), cleanUndefined({ status: 'closed', paymentMethod, totalAmount: Number(finalTotalAmount.toFixed(2)), updatedAt: new Date().toISOString() }));
    batch.set(doc(db, 'sales', newSalesRecord.id), cleanUndefined({ ...newSalesRecord, tenantId: currentUser?.tenantId || 'global' }));
    const table = tables.find(t => t.currentOrderId === orderId);
    if (table) batch.set(doc(db, 'tables', table.id || table.number.toString()), { ...table, status: 'available', currentOrderId: deleteField() }, { merge: true });
    batch.commit().catch(console.error);
    addAuditLog('ORDER_CLOSED', `Conta da Mesa ${order.tableNumber} encerrada. Valor Pago: R$ ${finalTotalAmount.toFixed(2)} via ${paymentMethod}`);
  };

  return (
    <RestaurantContext.Provider value={{
      tenantSettings, updateTenantSettings,
      currentUser,
      users,
      menu,
      inventory,
      orders,
      sales,
      tables,
      login,
      logout,
      addMenuItem,
      updateMenuItem,
      toggleMenuItemActive,
      deleteMenuItem,
      addIngredient,
      updateIngredient,
      deleteIngredient,
      restockIngredient,
      createOrder,
      updateOrderStatus,
      addItemsToOrder,
      closeBill,
      checkMenuItemStock,
      registerUser,
      updateUserPermissions,
      deleteUser,
      clientInstances,
      auditLogs,
      suppliers,
      supplyOrders,
      addSupplier,
      addSupplyOrder,
      updateSupplyOrderStatus,
      syncAndCleanOrphans,
      addClientInstance,
      updateClientSubscription,
      deleteClientInstance,
      addAuditLog,
      currentView,
      setView,
    }}>
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};
