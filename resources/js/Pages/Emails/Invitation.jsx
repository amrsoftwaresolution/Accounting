export default function InvitationEmail({ user, inviteUrl }) {
    return (
        <div style={{ margin: 0, padding: 0, fontFamily: 'Arial, sans-serif', background: '#f4f6fb', color: '#1f2937' }}>
            <table width="100%" cellPadding="0" cellSpacing="0" style={{ background: '#f4f6fb', padding: '32px 0' }}>
                <tbody>
                    <tr>
                        <td align="center">
                            <table width="600" cellPadding="0" cellSpacing="0" style={{ background: '#ffffff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(15,23,42,.08)' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: '40px 40px 24px', textAlign: 'center', background: '#111827', color: '#ffffff' }}>
                                            <h1 style={{ margin: 0, fontSize: '28px', lineHeight: 1.2, fontWeight: 900 }}>Welcome to {process.env.MIX_APP_NAME || 'our platform'}</h1>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '32px 40px 24px' }}>
                                            <p style={{ margin: 0, marginBottom: '18px', fontSize: '16px', lineHeight: 1.8, color: '#374151' }}>Hi {user.name},</p>
                                            <p style={{ margin: 0, marginBottom: '18px', fontSize: '16px', lineHeight: 1.8, color: '#374151' }}>
                                                You have been invited to join <strong>{process.env.MIX_APP_NAME || 'our platform'}</strong> as a <strong>{user.role}</strong>.
                                            </p>
                                            <p style={{ margin: 0, marginBottom: '28px', fontSize: '16px', lineHeight: 1.8, color: '#374151' }}>
                                                Click the button below to set your password and activate your account. This link will expire in 48 hours.
                                            </p>
                                            <p style={{ textAlign: 'center', margin: '0 0 30px' }}>
                                                <a href={inviteUrl} style={{ display: 'inline-block', padding: '16px 28px', background: '#111827', color: '#ffffff', borderRadius: '14px', textDecoration: 'none', fontWeight: 700 }}>
                                                    Set Your Password
                                                </a>
                                            </p>
                                            <p style={{ margin: 0, marginBottom: '8px', fontSize: '14px', lineHeight: 1.7, color: '#6b7280' }}>
                                                If the button does not work, copy and paste the following link into your browser:
                                            </p>
                                            <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.7, color: '#6b7280', wordBreak: 'break-word' }}>
                                                <a href={inviteUrl} style={{ color: '#111827', textDecoration: 'none' }}>{inviteUrl}</a>
                                            </p>
                                            <p style={{ margin: '32px 0 0', fontSize: '14px', lineHeight: 1.7, color: '#6b7280' }}>
                                                If you did not expect this invitation, please ignore this email or contact your administrator.
                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '24px 40px', background: '#f9fafb', color: '#6b7280', fontSize: '13px', lineHeight: 1.7 }}>
                                            <p style={{ margin: 0 }}>This invitation expires in 48 hours.</p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
