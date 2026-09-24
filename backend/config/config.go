package config

type Configuration struct {
	// pocketbase
	// jwt
	// any other services...
	Jwt JwtConfig
}

type JwtConfig struct {
	Secret string
}

// should not run the application if this fails
func Load() *Configuration {
	return &Configuration{}
}
