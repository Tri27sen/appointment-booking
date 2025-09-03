
tests/
├── setup.js              # Global test setup and teardown
├── helpers/
│   └── testHelpers.js     # Reusable test utilities
├── e2e/
│   ├── auth.test.js       # Authentication endpoints
│   ├── availability.test.js # Availability management
│   ├── appointments.test.js # Appointment booking/canceling
│   ├── health.test.js     # Health check endpoint
│   ├── integration.test.js # Complete workflow tests
│   └── performance.test.js # Performance benchmarks
└── README.md              # This file

Install Dependencies
bashnpm install
Run All E2E Tests
bashnpm run test:e2e
Run Specific Test Suites
bashnpm run test:e2e:suite auth          # Authentication tests
npm run test:e2e:suite availability  # Availability tests
npm run test:e2e:suite appointments  # Appointment tests
npm run test:e2e:suite integration   # Full workflow tests
npm run test:e2e:suite performance   # Performance tests