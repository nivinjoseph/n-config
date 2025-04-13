# n-config

A powerful and flexible configuration management library for Node.js applications.

## Features

- Multi-source configuration management
- Environment variable support
- Command-line argument parsing
- Configuration file support (JSON)
- Package.json integration
- Type-safe configuration access
- Custom configuration providers
- Browser and Node.js support

## Installation

```bash
npm install @nivinjoseph/n-config

or

yarn add @nivinjoseph/n-config
```

## Usage

### Basic Usage

```typescript
import { ConfigurationManager } from "@nivinjoseph/n-config";

// Get a configuration value
const apiUrl = ConfigurationManager.getConfig<string>("apiUrl");

// Get all configurations
const allConfigs = ConfigurationManager.getConfig<Record<string, any>>("*");

// Get configurations matching a pattern
const apiConfigs = ConfigurationManager.getConfig<Record<string, any>>("*api*");
```

### Required Configurations

```typescript
// Get a required configuration value
const requiredValue = ConfigurationManager.requireConfig("requiredKey");

// Get a required string configuration
const requiredString = ConfigurationManager.requireStringConfig("stringKey");

// Get a required number configuration
const requiredNumber = ConfigurationManager.requireNumberConfig("numberKey");

// Get a required boolean configuration
const requiredBoolean = ConfigurationManager.requireBooleanConfig("booleanKey");
```

### Custom Configuration Providers

```typescript
import { ConfigurationManager, ConfigurationProvider } from "@nivinjoseph/n-config";

class CustomProvider implements ConfigurationProvider {
    async provide(): Promise<Object> {
        return {
            customKey: "customValue"
        };
    }
}

// Initialize custom providers
await ConfigurationManager.initializeProviders([new CustomProvider()]);
```

## Configuration Sources

The library automatically loads configurations from multiple sources. When the same key exists in multiple sources, the value from the source with higher precedence will be used. The precedence order (from highest to lowest) is:

1. Command-line arguments
2. Environment variables
3. Custom configuration providers
4. Configuration files (config.json)
5. Package.json metadata

For example, if you have:
- `PORT=3000` in your `.env` file
- `PORT=8080` as a command-line argument

The final value of `PORT` will be `8080` because command-line arguments have higher precedence than environment variables.

### Environment Variables

Environment variables can be set in your `.env` file or through the system environment.

```env
API_URL=https://api.example.com
DEBUG=true
PORT=3000
```

### Command-line Arguments

Configuration values can be passed as command-line arguments in the format `key=value`:

```bash
node app.js apiUrl=https://api.example.com debug=true port=3000
```

### Configuration File

Create a `config.json` file in your project root:

```json
{
    "apiUrl": "https://api.example.com",
    "debug": true,
    "port": 3000
}
```

## Type Safety

The library provides type-safe methods for accessing configuration values:

- `getConfig<T>(key: string): T` - Generic method for type-safe configuration access
- `requireStringConfig(key: string): string` - Ensures string values
- `requireNumberConfig(key: string): number` - Ensures number values
- `requireBooleanConfig(key: string): boolean` - Ensures boolean values

## Browser Support

The library works in both Node.js and browser environments. In the browser, it can read configuration from:

- Global `APP_CONFIG` object
- Window configuration object (hex-encoded JSON)

## Contributing

Contributions are welcome! Please follow the existing code style and include tests for new features.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
