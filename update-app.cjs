const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Update InteractiveCard props
code = code.replace(
  "<InteractiveCard \n                  card={card} \n                  onToggleFreeze={handleToggleCardFreeze} \n                  onChangeColor={handleChangeCardColor} \n                />",
  "<InteractiveCard \n                  card={card} \n                  onToggleFreeze={handleToggleCardFreeze} \n                  onChangeColor={handleChangeCardColor} \n                  user={currentUser}\n                  isDarkMode={isDarkMode}\n                />"
);

// Update GoalTracker props
code = code.replace(
  "<GoalTracker \n                  goal={goal} \n                  onAddFunds={handleAddGoalFunds} \n                  checkingBalance={activeUserWallet.availableBalance} \n                />",
  "<GoalTracker \n                  goal={goal} \n                  onAddFunds={handleAddGoalFunds} \n                  checkingBalance={activeUserWallet.availableBalance} \n                  isDarkMode={isDarkMode}\n                  user={currentUser}\n                />"
);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx updated');
