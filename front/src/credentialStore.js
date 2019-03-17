const credentialStore = {
  saveToken: token => {
    localStorage.setItem("token", token)
  },

  loadToken: () => {
    const token = localStorage.getItem("token")
    if (token !== null) return token
  },

  clearToken: () => {
    localStorage.removeItem("token")
  },

  saveAdmin: admin => {
    localStorage.setItem("admin", JSON.stringify(admin))
  },

  loadAdmin: () => {
    const admin = localStorage.getItem("admin")
    if (admin !== null) return JSON.parse(admin)
  },

  clearAdmin: () => {
    localStorage.removeItem("admin")
  },

  load: () => {
    const rawCredentials = localStorage.getItem("credentials")
    if (rawCredentials === null) return {}
    return JSON.parse(rawCredentials)
  },

  clearUsernameAndPassword: () => {
    localStorage.removeItem("credentials")
  },
}

export default credentialStore
