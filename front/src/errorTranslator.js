export default function errorTranslator(error) {
  switch (error) {
    case "invalid_credentials":
      return "Identifiants invalides"
    case "server_error":
      return "Erreur serveur"
    case "lock_control_failed":
      return "Le controle de la serrure a échoué"
    case "invalid_username":
      return "Nom d'utilisateur invalide"
    case "empty_password":
      return "Mot de passe non renseigné"
    case "username_already_exists":
      return "Nom d'utilisateur déjà pris"
    case "logged_in":
      return "Connexion réussie"
    case undefined:
      return undefined
    default:
      console.warn("Unknown error message", error)
      return undefined
  }
}
