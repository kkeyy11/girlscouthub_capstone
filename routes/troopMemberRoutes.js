const express = require('express');
const router = express.Router();
const controller = require('../controllers/troopMemberController');

router.get('/', controller.listTroopMembers);
router.get('/add', controller.showAddForm);
router.post('/add', controller.createTroopMember);
router.post('/edit/:id', controller.updateTroopMember);
router.post('/delete/:id', controller.deleteTroopMember);
router.get('/api/:id', controller.getTroopMemberAPI);

module.exports = router;
