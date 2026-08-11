sed -i 's/<div className="flex justify-between items-start w-full">/<div className="flex justify-between items-start w-full shrink-0">/g' src/components/WaiterDashboard.tsx
sed -i 's/px-1.5 py-0.5 rounded font-extrabold uppercase">/px-1.5 py-0.5 rounded font-extrabold uppercase shrink-0 ml-1">/g' src/components/WaiterDashboard.tsx
sed -i 's/<div>/<div className="flex-1 flex flex-col justify-center min-h-0">/g' src/components/WaiterDashboard.tsx
sed -i 's/tracking-tight block ${isOccupied/tracking-tight block truncate ${isOccupied/g' src/components/WaiterDashboard.tsx
sed -i 's/block mt-1">/block mt-0.5 truncate">/g' src/components/WaiterDashboard.tsx
