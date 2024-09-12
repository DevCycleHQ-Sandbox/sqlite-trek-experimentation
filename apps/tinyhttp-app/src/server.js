import run from "./app.js";
let port = 3000;
let remainingAttempts = 3;

run().then((app) => {
  const server = app.listen(port, () =>
    console.log(`Example app listening on port ${port}`)
  );

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`Port ${port} is already in use.`);
      if (remainingAttempts-- > 0) {
        port++;
        setTimeout(() => server.listen(port), 500);
      }
    }
  });
});
