import './tracer.js';
import next from 'next';
import { createServer } from 'http'
import { parse } from 'url'

const port = 3000;

const app = next({
	dev: false,
});
const handle = app.getRequestHandler();


app.prepare().then(() => {
    createServer(async (req, res) => {
      req.imcustom = 'hello';

      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    }).listen(port)
  
    console.log(
      `> Server listening at http://localhost:${port}`
    )
  })
