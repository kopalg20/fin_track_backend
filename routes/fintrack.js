import express from 'express';
import {
  findUsers,
  addUsers,
  addIncome,
  addExpenses,
  getExpenses,
  getIncome,
  deleteUser,
  addSavingGoal,
  addTransaction,
  findAllGoals, // Import the findAllGoals function
  getTransaction // Import the getTransaction function
} from '../fintrackFunctions.js';

const router = express.Router();

// 1. Find users
router.post('/findUsers', async (req, res) => {
  const{username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const { data, error } = await findUsers({ username, password });
  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: 'Login successful', user: data });
});

// 2. Add users
router.post('/addUsers', async (req, res) => {
  const { data, error } = await addUsers(req.body);
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// 3. Add income
router.post('/addIncome', async (req, res) => {
  const { data, error } = await addIncome(req.body);
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// 4. Add expenses
router.post('/addExpenses', async (req, res) => {
  const { data, error } = await addExpenses(req.body);
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// 5. Get expenses
router.get('/getExpenses/:user_id', async (req, res) => {
  const { data, error } = await getExpenses(req.params.user_id);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// 6. Get income
router.get('/getIncome/:user_id', async (req, res) => {
  const { data, error } = await getIncome(req.params.user_id);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// 7. Delete user
router.delete('/deleteUser/:id', async (req, res) => {
  const { error } = await deleteUser(req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'User deleted' });
});

// 8. Add saving goal
router.post('/addSavingGoal', async (req, res) => {
  const { user_id, goal_name, target_amount } = req.body;

  console.log('Request to add saving goal:', req.body); // Debugging log

  if (!user_id || !goal_name || !target_amount) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const { goal_id, error } = await addSavingGoal(req.body);

  if (error) {
    console.error('Error in addSavingGoal:', error); // Log the error
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }

  res.status(201).json({ goal_id });
});

// 9. Add transaction to a goal
router.post('/addTransaction', async (req, res) => {
  const { goal_id, user_id, amount } = req.body;

  // Validate input
  if (!goal_id || !user_id || !amount) {
    return res.status(400).json({ error: 'Goal ID, User ID, and Amount are required' });
  }

  // Call the addTransaction function
  const result = await addTransaction({ goal_id, user_id, amount });

  if (result.error) {
    return res.status(400).json({ error: result.error.message });
  }

  res.status(201).json({ message: 'Transaction added successfully' });
});

// 10. Find all goals for a user
router.get('/findAllGoals/:user_id', async (req, res) => {
  const { user_id } = req.params;

  // Validate input
  if (!user_id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  // Call the findAllGoals function
  const { data, error } = await findAllGoals(user_id);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 11. Get transaction for a user by user_id and created_at
router.get('/getTransaction', async (req, res) => {
  const { user_id } = req.query;

  // Validate input
  if (!user_id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  // Call the getTransaction function
  const { data, error } = await getTransaction({ user_id });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

export default router;
