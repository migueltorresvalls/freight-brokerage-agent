# variables.tf

variable "authorization_bearer" {
  description = "Authorization bearer"
  type        = string
  sensitive   = true 
}

variable "fmcsa_api_key" {
  description = "FMCSA API key"
  type        = string
  sensitive   = true
}

variable "docker_username" {
  description = "Docker Hub username"
  type        = string
}