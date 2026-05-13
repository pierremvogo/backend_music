import { I18nService } from 'nestjs-i18n';

export type Language = '';

type EmailTemplate<T = void> = {
  subject: string;
  html: (value: T) => string;
};

const baseLayout = (title: string, content: string) => `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#f4f6f8;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;color:#111;">
            <tr>
              <td style="padding:24px 32px;background:#111;color:#ffffff;">
                <h1 style="margin:0;font-size:22px;">Bbok</h1>
              </td>
            </tr>

            <tr>
              <td style="padding:32px;">
                <h2 style="margin-top:0;font-size:20px;">${title}</h2>
                ${content}
              </td>
            </tr>

            <tr>
              <td style="padding:20px 32px;font-size:12px;color:#777;border-top:1px solid #eee;">
                © ${new Date().getFullYear()} Bbok — All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

const codeBlock = (code: string) => `
<div style="margin:24px 0;padding:16px;background:#f4f6f8;border-radius:8px;text-align:center;">
  <span style="font-size:28px;letter-spacing:6px;font-weight:bold;">${code}</span>
</div>
`;

const button = (label: string, url: string) => `
<div style="margin:32px 0;text-align:center;">
  <a href="${url}"
     style="background:#111;color:#ffffff;padding:14px 28px;border-radius:8px;
            text-decoration:none;font-weight:bold;display:inline-block;">
    ${label}
  </a>
</div>
`;

export const emailContent: {
  verifyEmail: (lang: string, i18n: I18nService) => EmailTemplate<string>;
  resetPassword: (lang: string, i18n: I18nService) => EmailTemplate<string>;
  thankYouTester: (lang: string, i18n: I18nService) => EmailTemplate<string>;
} = {
  verifyEmail: (lang: string, i18n: I18nService) => ({
    subject: i18n.translate('auth.email.CONFIRM_YOUR_EMAIL_ADDRESS', {
      lang,
    }),
    html: (token) =>
      baseLayout(
        i18n.translate('auth.email.CONFIRM_YOUR_EMAIL', {
          lang,
        }),
        `
        <p>${i18n.translate('auth.email.WELCOME_MESSAGE', {
          lang,
        })} 👋</p>
        <p>${i18n.translate('auth.email.USE_VERIFICATION_CODE', {
          lang,
        })}:</p>
        ${codeBlock(token)}
        <p>${i18n.translate('auth.email.CODE_EXPIRES_IN', {
          lang,
        })} <strong>15 min</strong>.</p>
        <p>${i18n.translate('auth.email.IGNORE_EMAIL', {
          lang,
        })}</p>
      `,
      ),
  }),

  resetPassword: (lang: string, i18n: I18nService) => ({
    subject: i18n.translate('auth.email.RESET_PASSWORD', {
      lang,
    }),
    html: (url) =>
      baseLayout(
        i18n.translate('auth.email.RESET_PASSWORD', {
          lang,
        }),
        `
          <p>${i18n.translate('auth.email.REQUEST_PASSWORD_RESET', {
            lang,
          })}</p>
          <p>${i18n.translate('auth.email.CLICK_BUTTON_NEW_PASSWORD', {
            lang,
          })}:</p>
          ${button(
            i18n.translate('auth.email.RESET_PASSWORD', {
              lang,
            }),
            url,
          )}
          <p>${i18n.translate('auth.email.LINK_EXPIRES_IN', {
            lang,
          })} <strong>15 min</strong>.</p>
        `,
      ),
  }),

  thankYouTester: (lang: string, i18n: I18nService) => ({
    subject: `${i18n.translate('auth.email.THANK_FOR_PARTICIPATION', {
      lang,
    })} 🎧`,
    html: () =>
      baseLayout(
        ` ${i18n.translate('auth.email.THANK_YOU', {
          lang,
        })} 🎉`,
        `
          <p>${i18n.translate('auth.email.SUCCESSFUL_RECEIVED_PARTICIPATION', { lang })}.</p>
          <p>${i18n.translate('auth.email.FEEDBACK_HELP', { lang })} Bbok.</p>
          <p>
            ${i18n.translate('auth.email.contact.MESSAGE', {
              lang,
              args: {
                phone: '+237675544431',
                email: 'mcarmebis@gmail.com',
              },
            })}
          </p>
          `,
      ),
  }),
};
