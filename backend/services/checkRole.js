require("dotenv").config();

function checkRole(req, res, next) {
  console.log('Inside checkRole function');
  if (res.locals.role == process.env.USER) 
  res.sendStatus(401);
  else next();
  console.log('res.locals.role', res.locals.role);
}

module.exports = { checkRole: checkRole };
