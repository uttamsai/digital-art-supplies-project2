// Finish saving the session before sending the response.
export function saveSession(request) {
  return new Promise((resolve, reject) =>
    request.session.save((error) => (error ? reject(error) : resolve())),
  )
}

export function regenerateSession(request) {
  return new Promise((resolve, reject) =>
    request.session.regenerate((error) => (error ? reject(error) : resolve())),
  )
}
