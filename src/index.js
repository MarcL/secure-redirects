import onHeaders from 'on-headers';
import url from 'url';

const locationHeaderName = 'Location';

function secureRedirects(options = {}) {
    function isInvalidRedirect(redirectHostName, currentHostName) {
        return redirectHostName !== currentHostName;
    }

    const domainValidator = options.validator || isInvalidRedirect;

    return (request, response, next) => {
        function validateRedirects() {
            const locationHeader = this.get(locationHeaderName);

            if (locationHeader) {
                const {hostname: redirectHostname} = url.parse(locationHeader);
                const currentHost = request.hostname;

                if (domainValidator(redirectHostname, currentHost)) {
                    const protocol = request.protocol;
                    this.set('Location', `${protocol}://${currentHost}`);
                }
            }
        }

        onHeaders(response, validateRedirects);
        next();
    };
}

export default secureRedirects;
