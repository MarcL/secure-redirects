import onHeaders from 'on-headers';
import url from 'url';

const locationHeaderName = 'Location';

function secureRedirects() {

    function isInvalidRedirect(redirectUrl, currentHost) {
        return redirectUrl !== currentHost;
    }

    return (request, response, next) => {
        function validateRedirects() {
            const locationHeader = this.get(locationHeaderName);

            if (locationHeader) {
                const {hostname: redirectHostname} = url.parse(locationHeader);
                const currentHost = request.hostname;

                if (isInvalidRedirect(redirectHostname, currentHost)) {
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
