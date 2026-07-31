# Test runner output modes

The Node test runner is quiet by default:

- passing tests are hidden
- coverage rows that are already 100% line / branch / function covered are hidden

To see everything again, set:

```bash
TEST_REPORT=full npm run test:node
```
