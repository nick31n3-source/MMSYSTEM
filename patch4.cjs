const fs = require('fs');
let file = fs.readFileSync('src/components/WaiterDashboard.tsx', 'utf8');

const lines = file.split('\n');
const startLineIndex = 217; // Index of line 218 is 217
const endLineIndex = 229; // Index of line 230 is 229

// We will replace from line 218 to line 230
const newLines = `        {selectedTable && (
          <button
            onClick={() => handleTableSelect(null)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors border border-white/10 text-sm font-semibold whitespace-nowrap"
          >
            &larr; Voltar para as Mesas
          </button>
        )}
      </div>

      {successMsg && (
        <div className="bg-emerald-950/30 border border-emerald-500/50 text-emerald-400 p-4 rounded-xl flex items-center gap-3 font-medium text-sm">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-950/30 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-center gap-3 font-medium text-sm">
          {errorMsg}
        </div>
      )}

      {!selectedTable ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {tables.map((table) => {
              const isOccupied = table.status === 'occupied';
              const activeOrder = orders.find(o => o.id === table.currentOrderId);
              return (
                <button
                  key={table.number}
                  onClick={() => handleTableSelect(table.number)}
                  className={\`
                    h-full min-h-[9rem] rounded-2xl border flex flex-col justify-between p-4 text-left transition-all group cursor-pointer relative shadow-sm
                    bg-[#070b14] hover:bg-[#0c1622]
                    \${isOccupied 
                       ? 'border-amber-400/50 hover:border-amber-400' 
                       : 'border-white/10 hover:border-white/30'
                    }
                  \`}
                >`.split('\n');

const modifiedLines = [
  ...lines.slice(0, 217),
  ...newLines,
  ...lines.slice(230)
];

fs.writeFileSync('src/components/WaiterDashboard.tsx', modifiedLines.join('\n'));
console.log("Reconstructed");
