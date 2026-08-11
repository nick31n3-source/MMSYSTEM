const currentPerms = ['dashboard', 'reports', 'menu'];
const permToken = 'reports';
const isAllowed = currentPerms.includes(permToken);
let updatedPerms;
if (isAllowed) {
  updatedPerms = currentPerms.filter(p => p !== permToken);
} else {
  updatedPerms = [...currentPerms, permToken];
}
console.log(updatedPerms);
