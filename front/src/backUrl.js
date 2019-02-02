const backHost = process.env.REACT_APP_BACK_HOST

export default (command) => backHost + "/back/" + command
