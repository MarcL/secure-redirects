import httpMocks from 'node-mocks-http';
import proxyquire from 'proxyquire';

describe('Secure redirects', () => {
    const fakeResponse = httpMocks.createResponse();
    const fakeNext = () => {};
    const defaultHostname = 'example.com';
    const defaultProtocol = 'https';
    const defaultDomain = `${defaultProtocol}://${defaultHostname}`;

    let fakeRequest;
    let secureRedirects;
    let stubOnHeaders;
    let stubResponseGet;
    let stubResponseSet;
    let stubLoggerWarn;
    let fakeLogger;

    beforeEach(() => {
        stubOnHeaders = sinon.spy((response, callback) => {
            return callback.apply(response);
        });

        secureRedirects = proxyquire('../../src', {
            'on-headers': stubOnHeaders
        }).default;

        stubResponseGet = sinon.stub().returns('');
        stubResponseSet = sinon.stub().returns('');
        stubLoggerWarn = sinon.stub();
        fakeLogger = {
            warn: stubLoggerWarn
        };
        fakeResponse.get = stubResponseGet;
        fakeResponse.set = stubResponseSet;

        fakeRequest = httpMocks.createRequest();
        fakeRequest.hostname = defaultHostname;
        fakeRequest.protocol = defaultProtocol;
        fakeRequest.Host = null;
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

    describe('if request is redirecting', () => {
        describe('with default validator', () => {
            describe('should not set Location header', () => {
                it('if redirecting to a local path', () => {
                    stubResponseGet.withArgs('Location').returns('/local-path');
                    secureRedirects()(fakeRequest, fakeResponse, fakeNext);

                    expect(stubResponseSet).to.not.have.been.called;
                });

                it('if redirecting to the same domain', () => {
                    stubResponseGet.withArgs('Location').returns(`${defaultDomain}/some-path`);
                    secureRedirects()(fakeRequest, fakeResponse, fakeNext);

                    expect(stubResponseSet).to.not.have.been.called;
                });

                it('if redirecting to the same domain and port is set', () => {
                    const defaultPort = 3000;
                    const givenHostname = `${defaultHostname}:${defaultPort}`;
                    fakeRequest.Host = givenHostname;
                    stubResponseGet.withArgs('Location').returns(`http://${givenHostname}/some-path`);
                    secureRedirects()(fakeRequest, fakeResponse, fakeNext);

                    expect(stubResponseSet).to.not.have.been.called;
                });
            });

            describe('if redirect URL redirects outside the current domain', () => {
                const givenBadRedirectUrl = 'https://baddomain.com/bad-path';

                beforeEach(() => {
                    stubResponseGet.withArgs('Location').returns(givenBadRedirectUrl);
                });

                it('should set Location header to default URL', () => {
                    secureRedirects()(fakeRequest, fakeResponse, fakeNext);

                    expect(stubResponseSet)
                        .to.have.been.calledWithExactly('Location', defaultDomain);
                });

                it('should set Location header to default URL with port if set', () => {
                    const defaultPort = 3000;
                    const givenHostname = `${defaultHostname}:${defaultPort}`;
                    const expectedDomain = `${defaultProtocol}://${givenHostname}`;
                    fakeRequest.Host = givenHostname;

                    secureRedirects()(fakeRequest, fakeResponse, fakeNext);

                    expect(stubResponseSet)
                        .to.have.been.calledWithExactly('Location', expectedDomain);
                });

                it('should call logger.warn with expected urls', () => {
                    const givenOptions = {logger: fakeLogger};
                    const expectedMetadata = {
                        redirectUrl: givenBadRedirectUrl,
                        securedUrl: defaultDomain
                    };
                    secureRedirects(givenOptions)(fakeRequest, fakeResponse, fakeNext);

                    expect(stubLoggerWarn)
                        .to.have.been.calledWithExactly('Securing bad redirect', expectedMetadata);
                });

                it('should set Location to be expected URL if passed with options', () => {
                    const givenRedirectUrl = 'https://www.differentdomain.com/some-path';
                    const givenOptions = {
                        redirectUrl: givenRedirectUrl
                    };

                    secureRedirects(givenOptions)(fakeRequest, fakeResponse, fakeNext);
                    expect(stubResponseSet)
                        .to.have.been.calledWithExactly('Location', givenRedirectUrl);
                });
            });
        });

        describe('with custom validator', () => {
            let stubValidator;
            let defaultOptions;

            beforeEach(() => {
                stubValidator = sinon.stub().returns(true);
                defaultOptions = {
                    validator: stubValidator
                };

                stubResponseGet.withArgs('Location').returns(`${defaultDomain}/some-path`);
            });

            it('should call the custom validator if redirecting', () => {
                secureRedirects(defaultOptions)(fakeRequest, fakeResponse, fakeNext);

                expect(stubValidator).to.be.calledOnce;
            });

            it('should call the custom validator with expected hostname and domain name', () => {
                const badDomain = 'baddomain.com';
                const givenRedirectUrl = `https://${badDomain}/some-path`;
                stubResponseGet.withArgs('Location').returns(givenRedirectUrl);
                secureRedirects(defaultOptions)(fakeRequest, fakeResponse, fakeNext);

                expect(stubValidator).to.be.calledWithExactly(badDomain, defaultDomain);
            });

            it('should set Location header to default URL if custom validator returns false', () => {
                stubValidator.returns(false);
                secureRedirects(defaultOptions)(fakeRequest, fakeResponse, fakeNext);

                expect(stubResponseSet)
                    .to.have.been.calledWithExactly('Location', defaultDomain);
            });

            it('should set Location header to default URL if custom validator returns true', () => {
                stubValidator.returns(true);
                secureRedirects(defaultOptions)(fakeRequest, fakeResponse, fakeNext);

                expect(stubResponseSet).to.not.have.been.called;
            });
        });
    });

});
