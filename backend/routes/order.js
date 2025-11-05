const express = require('express')
const router = express.Router();

const { newOrder,
	myOrders,
	getSingleOrder,
		deleteOrder,
	allOrders,
	updateOrder,

	} = require('../controllers/order')
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth')

router.route('/order/new').post(isAuthenticatedUser, newOrder);
router.get('/orders/me', isAuthenticatedUser, myOrders);
router.route('/order/:id').get(isAuthenticatedUser, getSingleOrder);
router.get('/admin/orders/', isAuthenticatedUser, allOrders);
// router.route('/admin/order/:id').delete(isAuthenticatedUser, deleteOrder);
router.route('/admin/order/:id').put(isAuthenticatedUser, updateOrder).delete(isAuthenticatedUser, deleteOrder);
module.exports = router;