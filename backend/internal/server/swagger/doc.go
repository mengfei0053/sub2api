// Package swagger holds OpenAPI annotation stubs for swag code generation.
package swagger

// HealthCheck godoc
//
//	@Summary		Health check
//	@Description	Returns service health status
//	@Tags			system
//	@Produce		json
//	@Success		200	{object}	map[string]string
//	@Router			/health [get]
func HealthCheck() {}

// SetupStatus godoc
//
//	@Summary		Setup status
//	@Description	Returns whether initial setup is required
//	@Tags			setup
//	@Produce		json
//	@Success		200	{object}	map[string]interface{}
//	@Router			/setup/status [get]
func SetupStatus() {}

// AuthRegister godoc
//
//	@Summary		Register
//	@Tags			auth
//	@Accept			json
//	@Produce		json
//	@Param			body	body		object	true	"Register payload"
//	@Success		200		{object}	map[string]interface{}
//	@Router			/api/v1/auth/register [post]
func AuthRegister() {}

// AuthLogin godoc
//
//	@Summary		Login
//	@Tags			auth
//	@Accept			json
//	@Produce		json
//	@Param			body	body		object	true	"Login payload"
//	@Success		200		{object}	map[string]interface{}
//	@Router			/api/v1/auth/login [post]
func AuthLogin() {}

// AuthRefresh godoc
//
//	@Summary		Refresh token
//	@Tags			auth
//	@Accept			json
//	@Produce		json
//	@Param			body	body		object	true	"Refresh token payload"
//	@Success		200		{object}	map[string]interface{}
//	@Router			/api/v1/auth/refresh [post]
func AuthRefresh() {}

// AuthMe godoc
//
//	@Summary		Current user
//	@Tags			auth
//	@Produce		json
//	@Security		BearerAuth
//	@Success		200	{object}	map[string]interface{}
//	@Router			/api/v1/auth/me [get]
func AuthMe() {}

// PublicSettings godoc
//
//	@Summary		Public site settings
//	@Tags			settings
//	@Produce		json
//	@Success		200	{object}	map[string]interface{}
//	@Router			/api/v1/settings/public [get]
func PublicSettings() {}

// ListAPIKeys godoc
//
//	@Summary		List API keys
//	@Tags			keys
//	@Produce		json
//	@Security		BearerAuth
//	@Success		200	{array}		map[string]interface{}
//	@Router			/api/v1/keys [get]
func ListAPIKeys() {}

// CreateAPIKey godoc
//
//	@Summary		Create API key
//	@Tags			keys
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Param			body	body		object	true	"Create key payload"
//	@Success		200		{object}	map[string]interface{}
//	@Router			/api/v1/keys [post]
func CreateAPIKey() {}

// UserProfile godoc
//
//	@Summary		Get user profile
//	@Tags			user
//	@Produce		json
//	@Security		BearerAuth
//	@Success		200	{object}	map[string]interface{}
//	@Router			/api/v1/user/profile [get]
func UserProfile() {}

// GatewayMessages godoc
//
//	@Summary		Anthropic-compatible messages
//	@Description	Claude / Anthropic Messages API compatible endpoint
//	@Tags			gateway
//	@Accept			json
//	@Produce		json
//	@Security		APIKeyAuth
//	@Param			body	body		object	true	"Messages request"
//	@Success		200		{object}	map[string]interface{}
//	@Router			/v1/messages [post]
func GatewayMessages() {}

// GatewayChatCompletions godoc
//
//	@Summary		OpenAI chat completions
//	@Tags			gateway
//	@Accept			json
//	@Produce		json
//	@Security		APIKeyAuth
//	@Param			body	body		object	true	"Chat completion request"
//	@Success		200		{object}	map[string]interface{}
//	@Router			/v1/chat/completions [post]
func GatewayChatCompletions() {}

// GatewayModels godoc
//
//	@Summary		List models
//	@Tags			gateway
//	@Produce		json
//	@Security		APIKeyAuth
//	@Success		200	{object}	map[string]interface{}
//	@Router			/v1/models [get]
func GatewayModels() {}

// GatewayUsage godoc
//
//	@Summary		Usage statistics
//	@Tags			gateway
//	@Produce		json
//	@Security		APIKeyAuth
//	@Success		200	{object}	map[string]interface{}
//	@Router			/v1/usage [get]
func GatewayUsage() {}

// GeminiModels godoc
//
//	@Summary		List Gemini models
//	@Tags			gateway
//	@Produce		json
//	@Security		APIKeyAuth
//	@Success		200	{object}	map[string]interface{}
//	@Router			/v1beta/models [get]
func GeminiModels() {}

// AdminDashboard godoc
//
//	@Summary		Admin dashboard
//	@Tags			admin
//	@Produce		json
//	@Security		BearerAuth
//	@Success		200	{object}	map[string]interface{}
//	@Router			/api/v1/admin/dashboard/overview [get]
func AdminDashboard() {}

// AdminListUsers godoc
//
//	@Summary		List users
//	@Tags			admin
//	@Produce		json
//	@Security		BearerAuth
//	@Success		200	{object}	map[string]interface{}
//	@Router			/api/v1/admin/users [get]
func AdminListUsers() {}

// PaymentPlans godoc
//
//	@Summary		List subscription plans
//	@Tags			payment
//	@Produce		json
//	@Security		BearerAuth
//	@Success		200	{array}		map[string]interface{}
//	@Router			/api/v1/payment/plans [get]
func PaymentPlans() {}

// PaymentCreateOrder godoc
//
//	@Summary		Create payment order
//	@Tags			payment
//	@Accept			json
//	@Produce		json
//	@Security		BearerAuth
//	@Param			body	body		object	true	"Order payload"
//	@Success		200		{object}	map[string]interface{}
//	@Router			/api/v1/payment/orders [post]
func PaymentCreateOrder() {}
