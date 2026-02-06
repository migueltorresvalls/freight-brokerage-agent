terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "rg" {
  name     = "happy-robot-acme-logistics"
  location = "italynorth"
}

resource "azurerm_service_plan" "plan" {
  name                = "plan-logistics-free"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  os_type             = "Linux"
  sku_name            = "F1"
}

resource "azurerm_storage_account" "storage" {
  name                     = "stlogisticsdata${random_string.suffix.result}"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

resource "azurerm_storage_share" "share" {
  name                 = "sqlite-data"
  storage_account_name = azurerm_storage_account.storage.name
  quota                = 1
}

resource "azurerm_linux_web_app" "webapp" {
  name                = "app-logistics-api-${random_string.suffix.result}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_service_plan.plan.location
  service_plan_id     = azurerm_service_plan.plan.id

  site_config {
    application_stack {
      docker_image_name   = "${var.docker_username}/happy-robot-api:latest"
      docker_registry_url = "https://index.docker.io/v1"
    }
    always_on = false
  }

  app_settings = {
    "AUTHORIZATION_BEARER" = var.authorization_bearer
    "FMCSA_API_KEY"        = var.fmcsa_api_key
    "WEBSITES_PORT"        = "8000"
    "DOCKER_ENABLE_CI" = "true"
  }

  storage_account {
    name              = "sqlite-mount"
    account_name      = azurerm_storage_account.storage.name
    access_key        = azurerm_storage_account.storage.primary_access_key
    share_name        = azurerm_storage_share.share.name
    type              = "AzureFiles" 
    mount_path        = "/app/data"
  }
}

resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
}

output "api_url" {
  value = "https://${azurerm_linux_web_app.webapp.default_hostname}"
}