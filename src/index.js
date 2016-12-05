import onHeaders from 'on-headers';
import url from 'url';

function secureRedirects(options = {}) {

    function isValidRedirect(redirectHostName, currentHost) {
        const {hostname} = url.parse(currentHost);
        return (redirectHostName.indexOf(hostname) > -1);
    }

    function isLocalRedirect(locationHeader) {
        const parsedLocationHeader = url.parse(locationHeader);
        const {hostname} = parsedLocationHeader;
        return !hostname || hostname.charAt(0) === '/';
    }

    const domainValidator = options.validator || isValidRedirect;
    const logger = options.logger || console;

    return (request, response, next) => {
        const {protocol, hostname} = request;
        const hostUrl = `${protocol}://${hostname}`;

        function validateRedirects() {
            const redirectUrl = this.get('Location');

            if (redirectUrl) {
                const {hostname: redirectHostname} = url.parse(redirectUrl);

                if (!isLocalRedirect(redirectUrl) && !domainValidator(redirectHostname, hostUrl)) {
                    const domainWithPort = request.Host;
                    const securedRedirectUrl = domainWithPort ? `${protocol}://${domainWithPort}` : hostUrl;
                    this.set('Location', securedRedirectUrl);

                    const warningInfo = {
                        redirectUrl: redirectUrl,
                        securedUrl: securedRedirectUrl
                    };
                    logger.warn('Securing bad redirect', warningInfo);
                }
            }
        }

        onHeaders(response, validateRedirects);
        next();
    };
}

export default secureRedirects;
