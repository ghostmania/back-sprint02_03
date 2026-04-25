import express from 'express';
import {setupApp} from './setup-app';

export const app = express();
setupApp(app);

export default app;

if (require.main === module) {
    const PORT = process.env.PORT || 5001;

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
