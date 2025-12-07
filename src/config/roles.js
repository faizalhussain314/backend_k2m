const allRoles = {
  admin: ['getUsers', 'admin', 'Users', 'customer', 'vendor'],
  customer: ['getUsers', 'admin', 'Users', 'customer', 'vendor'],
  vendor: ['getUsers', 'admin', 'Users', 'customer', 'vendor'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights
};
