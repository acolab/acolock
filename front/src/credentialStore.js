const credentialStore = {
  save: ({username, password}) => {
    localStorage.setItem("credentials", JSON.stringify({username, password}))
  },

  load: () => {
    const rawCredentials = localStorage.getItem("credentials")
    if (rawCredentials === null)
      return {}
    return JSON.parse(rawCredentials)
  },

  clear: () => {
    localStorage.removeItem("credentials")
  }
}

export default credentialStore
