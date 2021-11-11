const backHost = process.env.REACT_APP_BACK_HOST

const backUrl = command => backHost + "/back/" + command

export default backUrl
