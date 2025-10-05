---
trigger: always_on
---

# Coding Conventions

## Naming Conventions
- Use **snake_case** for all variable names
  - Example: `user_profile`, `client_id`, `selected_client`
- Use **camelCase** for all function names
  - Example: `getUserProfile`, `getClientId`, `getSelectedClient`
- Use **PascalCase** for all class names
  - Example: `UserProfile`, `Client`, `User`
- Use **PascalCase** for all type and interface names
  - Example: `UserProfile`, `Props`, `UserData`

## Import Statements
- Always use **absolute imports** instead of relative imports
  - Example: `import { Button } from "@/app/_components/ui/Button"`
  - Instead of: `import { Button } from '../../../_components/ui/Button'`

## File Naming
- Use **Kebab Case** for component file names
  - Example: `user-profilel.tsx`, `update-client-modal.tsx`

## Styling
- Use **Tailwind CSS** utility classes for styling components
- Prefer **custom utility classes** from `global.css` when available
- For custom values, use Tailwind's arbitrary value syntax without units
  - Example: `p-[20]` instead of `p-[20px]`

## Formatting

All code formatting is managed by [Prettier](https://prettier.io/) using the project's `.prettierrc` configuration file. The current configuration includes:

- **Indentation**: Tabs
- **Tab Width**: 90 spaces
- **Print Width**: 800 characters
- **Semicolons**: Always included
- **Quotes**: Double quotes
- **Tailwind CSS Plugin**: Enabled for better Tailwind class sorting

## Documentation

All functions must use the following JSDoc format:

```typescript
/**
 * DOCU: <What does the function do>. <br>
 * Triggered: <What is the trigger>. <br>
 * Last Updated: <Date in format: Month DD, YYYY>
 * @author <Author Name>
 */
- Example

/**
 * DOCU: Fetches user profile data from the API. <br>
 * Triggered: When the user profile component mounts. <br>
 * Last Updated: August 01, 2025
 * @author <Author Name>
 */
async function getUserProfile(user_id: string) {
  // Implementation...
}

### Formatting Guidelines

1. **Format Only Changed Code**
   - When making changes, format only the specific code you're modifying, not the entire file
   - This helps prevent unnecessary changes in version control and makes code reviews more focused

2. **Using Prettier**
   - To format only specific files:
     ```bash
     npx prettier --write path/to/your/file.ts
     ```
   - To format only changed files in Git:
     ```bash
     git diff --name-only | xargs npx prettier --write
     ```

3. **Editor Integration**
   - Configure your editor to format on save
   - For VS Code, add to settings.json:
     ```json
     "editor.formatOnSave": true,
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "editor.codeActionsOnSave": {
       "source.organizeImports": true,
       "source.fixAll.eslint": true
     }
     ```

4. **Pre-commit Hooks**
   - Consider using a pre-commit hook to format only staged changes
   - Example using `lint-staged` in `package.json`:
     ```json
     "lint-staged": {
       "*.{js,jsx,ts,tsx,json,css,md}": [
         "prettier --write"
       ]
     }
     ```

**Note**: Always ensure your editor is properly configured to respect the project's Prettier settings for consistent formatting across the codebase.