import { supabase } from './supabaseClient.js';
import bcrypt from 'bcryptjs';

// 1. Find users
export async function findUsers({ username, password }) {
  const { data: users, error } = await supabase
    .from('Users')
    .select('*')
    .eq('username', username)
    .limit(1);

  if (error) return { error };
  if (users.length == 0) return { error: { message: 'User not found' } };

  const user = users[0];

  // Compare hashed password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return { error: { message: 'Invalid password' } };

  return { data: { id: user.id } };
}

// 2. Add users
export async function addUsers({ username, password }) {
  // Check if username already exists
  const { data: users, error: findError } = await supabase
    .from('Users')
    .select('id')
    .eq('username', username)
    .limit(1);

  if (findError) return { error: findError };
  if (users.length > 0) return { error: { message: 'Username already exists' } };

  // Hash the password before storing (assuming bcrypt is imported)
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert new user
  const { data, error } = await supabase
    .from('Users')
    .insert([{ username: username, password: hashedPassword }])
    .select('id')
    .single();

  if (error) return { error };
  return { data };
}



// 3. Add or update income for the same month and year
export async function addIncome({ user_id, amount, date }) {
  // Extract year and month from the provided date
  const inputDate = new Date(date);
  const inputYear = inputDate.getFullYear();
  const inputMonth = inputDate.getMonth() + 1; // getMonth() is 0-based

  // Find existing income for the same user, month, and year
  const { data: existing, error } = await supabase
    .from('income')
    .select('*')
    .eq('user_id', user_id);

  if (error) return { error };

  // Check if any entry matches the same month and year
  const match = existing.find(item => {
    const createdAt = new Date(item.created_at);
    return (
      createdAt.getFullYear() === inputYear &&
      createdAt.getMonth() + 1 === inputMonth
    );
  });

  if (match) {
    // Update the amount (you can decide to sum or replace)
    const { data, error: updateError } = await supabase
      .from('income')
      .update({ income: amount })
      .eq('income_id', match.income_id);

    if (updateError) return { error: updateError };
    return { data, updated: true };
  } else {
    // Insert new income
    const { data, error: insertError } = await supabase
      .from('income')
      .insert([{ user_id: user_id, income: amount}]);

    if (insertError) return { error: insertError };
    return { data, inserted: true };
  }
}

// 4. Add expenses
export async function addExpenses({ user_id, amount, category}) {
  return await supabase.from('expenses').insert([{ user_id: user_id, amount: amount, category: category}]);
}

// 5. Get expenses
export async function getExpenses(user_id) {
  const { data, error } = await supabase
    .rpc('get_expenses_grouped', { uid: user_id });
  if (error) return { error };
  return { data };
}

// 6. Get income
export async function getIncome(user_id) {
  const { data, error } = await supabase
    .from('income')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) return { error };
  return { data };
}

// 7. Delete user
export async function deleteUser(id) {
  return await supabase.from('Users').delete().eq('id', id);
}

// 8. Add saving goal
export async function addSavingGoal({ user_id, goal_name, target_amount }) {
  console.log('Adding saving goal:', { user_id, goal_name, target_amount }); // Debugging log

  // Insert the saving goal into the database and return the goal_id
  const { data, error } = await supabase
    .from('goals')
    .insert([
      {
        user_id: user_id,
        goal_name: goal_name,
        target_amount: target_amount,
      },
    ])
    .select('goal_id') // Use select to return the goal_id directly
    .single(); // Ensure a single object is returned

  if (error) {
    console.error('Error inserting saving goal:', error); // Log the error
    return { error };
  }

  console.log('Saving goal added successfully:', data); // Log the result
  return { goal_id: data.goal_id };
}

// 9. Add transaction to a goal
export async function addTransaction({ goal_id, user_id, amount }) {
  // Step 1: Update the invested_amount in the goals table
  const { data: goalData, error: goalError } = await supabase
    .from('goals')
    .select('invested_amount')
    .eq('goal_id', goal_id)
    .single();

  if (goalError) return { error: goalError };
  const updatedInvestedAmount = goalData.invested_amount + amount;

  const { error: updateGoalError } = await supabase
    .from('goals')
    .update({ invested_amount: updatedInvestedAmount })
    .eq('goal_id', goal_id);

  if (updateGoalError) return { error: updateGoalError };

  // Step 2: Update the goal_transactions table
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() is 0-based

  // Check if a transaction for the same user and month/year exists
  const { data: existingTransactions, error: transactionError } = await supabase
    .from('goal_transactions')
    .select('*')
    .eq('user_id', user_id);

  if (transactionError) return { error: transactionError };

  const existingTransaction = existingTransactions.find(transaction => {
    const createdAt = new Date(transaction.created_at);
    return (
      createdAt.getFullYear() === currentYear &&
      createdAt.getMonth() + 1 === currentMonth
    );
  });

  if (existingTransaction) {
    // Update the existing transaction
    const { error: updateTransactionError } = await supabase
      .from('goal_transactions')
      .update({ amount: existingTransaction.amount + amount })
      .eq('id', existingTransaction.id);

    if (updateTransactionError) return { error: updateTransactionError };
  } else {
    // Insert a new transaction
    const { error: insertTransactionError } = await supabase
      .from('goal_transactions')
      .insert([{ user_id: user_id, amount: amount }]);

    if (insertTransactionError) return { error: insertTransactionError };
  }

  return { message: 'Transaction added successfully' };
}

// 10. Find all goals for a user
export async function findAllGoals(user_id) {
  const { data, error } = await supabase
    .from('goals')
    .select('goal_id,goal_name, target_amount, invested_amount')
    .eq('user_id', user_id);

  if (error) return { error };
  return { data };
}

// 11. Get transaction for a user by user_id and created_at
export async function getTransaction({ user_id}) {
  // Extract year and month from the provided date
  const inputDate = new Date();
  const inputYear = inputDate.getFullYear();
  const inputMonth = inputDate.getMonth() + 1; // getMonth() is 0-based

  // Query the goal_transactions table
  const { data, error } = await supabase
    .from('goal_transactions')
    .select('amount, created_at')
    .eq('user_id', user_id);

  if (error) return { error };

  // Check if any entry matches the same month and year
  const match = data.find(transaction => {
    const createdAt = new Date(transaction.created_at);
    return (
      createdAt.getFullYear() === inputYear &&
      createdAt.getMonth() + 1 === inputMonth
    );
  });

  // Return the amount if a match is found, otherwise return 0
  if (match) {
    return { data: { amount: match.amount } };
  } else {
    return { data: { amount: 0 } };
  }
}
