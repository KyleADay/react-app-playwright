import { load, close, getTitle } from '../pageObjects';

describe("React App", () => {
    beforeEach(async () => {
        await load();
    });

    afterEach(async () => {
        await close();
    });

    it("should be titled 'React App'", async () => {
        expect(await getTitle()).toBe('React App');
    });
});
