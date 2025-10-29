import * as Sentry from "@sentry/node";
import  { nodeProfilingIntegration } from "@sentry/profiling-node";


Sentry.init({
  dsn: "https://fb2502db0c59a58f7d36a9abe3a47b9d@o4510233715605504.ingest.us.sentry.io/4510234324762624",
    sendDefaultPii: true,
    integrations: [
        Sentry.mongoIntegration()
    ],
                
});

export default Sentry;