const credentialStore = {
  saveToken: token => {
    localStorage.setItem("token", token)
  },

  loadToken: () => {
    const token = localStorage.getItem("token")
    if (token !== null) return token
  },

  load: () => {
    const rawCredentials = localStorage.getItem("credentials")
    if (rawCredentials === null) return {}
    return JSON.parse(rawCredentials)
  },

  clear: () => {
    localStorage.removeItem("credentials")
  },
}

export default credentialStore
