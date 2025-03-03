# Kitchen Planner

A standalone web application for managing recipes, planning meals, and generating shopping lists.

## Features

- **Recipe Management**: Create, edit, and delete recipes with sections and ingredients.
- **Meal Planning**: Plan your meals for the next 10 days with breakfast, lunch, and dinner options.
- **Shopping List**: Automatically generate a shopping list based on your meal plan, with ingredients aggregated across recipes.
- **Ingredient Reuse**: When adding ingredients to recipes, you can select from previously used ingredients to ensure consistency.

## Usage

1. Open `index.html` in your web browser to start using the application.
2. Add your recipes in the "Recipes" tab.
3. Plan your meals in the "Meal Plan" tab by clicking on meal slots and selecting recipes.
4. View your shopping list in the "Shopping List" tab.

## Data Storage

Currently, the application stores data in the browser's localStorage, which means:
- Your data persists between sessions on the same browser.
- Data is not shared between different browsers or devices.
- Clearing browser data will erase your recipes and meal plans.

## Future Improvements

For permanent data storage, consider implementing one of these options:

1. **File-based Storage**: Add export/import functionality to save and load data as JSON files.
2. **Backend Server**: Create a simple backend server (using Node.js, Python, etc.) to store data in a database.
3. **Cloud Storage**: Use a service like Firebase to store data in the cloud and enable cross-device access.
4. **IndexedDB**: Use the browser's IndexedDB for larger storage capacity than localStorage.

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- LocalStorage API

## License

This project is open source and available for personal and commercial use. 