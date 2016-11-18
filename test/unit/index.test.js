import httpMocks from 'node-mocks-http';
import proxyquire from 'proxyquire';

describe('Secure redirects', () => {
    const fakeRequest = httpMocks.createRequest();
    const fakeResponse = httpMocks.createResponse();
    const fakeNext = () => {};
    const defaultHostname = 'example.com';
    const defaultProtocol = 'https';
    const defaultDomain = `${defaultProtocol}://${defaultHostname}`;

    let secureRedirects;
    let stubOnHeaders;
    let stubResponseGet;
    let stubResponseSet;

    beforeEach(() => {
        stubOnHeaders = sinon.spy((response, callback) => {
            return callback.apply(response);
        });

        secureRedirects = proxyquire('../../src', {
            'on-headers': stubOnHeaders
        }).default;

        stubResponseGet = sinon.stub().returns('');
        stubResponseSet = sinon.stub().returns('');
        fakeResponse.get = stubResponseGet;
        fakeResponse.set = stubResponseSet;
        fakeRequest.hostname = defaultHostname;
        fakeRequest.protocol = defaultProtocol;
    });

    it('should call next', () => {
        const spyNext = sinon.spy();
        secureRedirects()(fakeRequest, fakeResponse, spyNext);
        expect(spyNext).to.have.been.calledWithExactly();
    });

    it('should not set Location header if not redirecting', () => {
        stubResponseGet.withArgs('Location').returns('');
        secureRedirects()(fakeRequest, fakeResponse, fakeNext);

        expect(stubResponseSet).to.not.have.been.called;
    });

    it('should not set Location header if redirecting to the same domain', () => {
        stubResponseGet.withArgs('Location').returns(`${defaultDomain}/some-path`);
        secureRedirects()(fakeRequest, fakeResponse, fakeNext);

        expect(stubResponseSet).to.not.have.been.called;
    });

    describe('if redirect URL redirects outside the current domain', () => {
        beforeEach(() => {
            stubResponseGet.withArgs('Location').returns('https://baddomain.com');
        });

        it('should set Location header to default URL', () => {
            secureRedirects()(fakeRequest, fakeResponse, fakeNext);

            expect(stubResponseSet)
                .to.have.been.calledWithExactly('Location', defaultDomain);
        });
    });
});
