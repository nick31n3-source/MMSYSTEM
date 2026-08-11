const fs = require('fs');
let code = fs.readFileSync('src/context/RestaurantContext.tsx', 'utf8');

const replacement = `    const unsubTables = onSnapshot(getQuery('tables'), (snap) => {
      const fetchedTables = snap.docs.map(d => d.data() as Table);
      const mergedTables = INITIAL_TABLES.map(initialTable => {
        const found = fetchedTables.find(t => t.number === initialTable.number);
        return found || initialTable;
      });
      setTables(mergedTables);
    });`;

code = code.replace(
  "    const unsubTables = onSnapshot(getQuery('tables'), (snap) => setTables(snap.docs.map(d => d.data() as Table).length ? snap.docs.map(d => d.data() as Table) : INITIAL_TABLES));",
  replacement
);

fs.writeFileSync('src/context/RestaurantContext.tsx', code);
