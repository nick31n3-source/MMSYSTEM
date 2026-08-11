const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
  "import { AuditLogs } from './components/AuditLogs';",
  "import { AuditLogs } from './components/AuditLogs';\nimport { LandingPage } from './components/LandingPage';"
);

app = app.replace(
  "  const { currentUser, currentView, setView } = useRestaurant();\n  const [isSidebarOpen, setIsSidebarOpen] = useState(false);\n\n  if (!currentUser) {\n    return <Login />;\n  }",
  "  const { currentUser, currentView, setView } = useRestaurant();\n  const [isSidebarOpen, setIsSidebarOpen] = useState(false);\n  const [showLogin, setShowLogin] = useState(false);\n\n  if (!currentUser) {\n    if (showLogin) return <Login onBack={() => setShowLogin(false)} />;\n    return <LandingPage onLoginClick={() => setShowLogin(true)} />;\n  }"
);

fs.writeFileSync('src/App.tsx', app);

