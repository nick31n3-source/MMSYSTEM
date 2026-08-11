const fs = require('fs');

let sidebar = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

// Remove states
sidebar = sidebar.replace(
  "  const [testSummary, setTestSummary] = useState<TestSuiteSummary | null>(null);\n  const [isRunningTests, setIsRunningTests] = useState(false);\n",
  ""
);

// Remove function
const handleRunSystemTestsRegex = /  const handleRunSystemTests = \(\) => \{[\s\S]*?\}, 600\);\n  \};\n/;
sidebar = sidebar.replace(handleRunSystemTestsRegex, "");

// Remove run tests button in UI
const runTestsButtonRegex = /          <div className="px-3 space-y-2">\s*<button[\s\S]*?🧪 EXECUTAR TESTES DE INTEGRIDADE[\s\S]*?<\/button>\s*/;
sidebar = sidebar.replace(runTestsButtonRegex, "");

// Remove test results modal
const testResultsModalRegex = /\s*\{\/\* AUTOMATED TEST RESULTS MODAL \*\/\}\s*<AnimatePresence>[\s\S]*?<\/AnimatePresence>/;
sidebar = sidebar.replace(testResultsModalRegex, "");

// Remove import
sidebar = sidebar.replace("import { runSystemIntegrityTests, TestSuiteSummary } from '../utils/systemTests';\n", "");

fs.writeFileSync('src/components/Sidebar.tsx', sidebar);

