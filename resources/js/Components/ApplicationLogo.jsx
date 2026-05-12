export default function ApplicationLogo({ className = '', type = 'icon', ...props }) {
    return (
        <img
            {...props}
            src={type === 'icon' ? "/images/icon.png" : "/images/logo.png"}
            alt="Application Logo"
            className={`${className} object-contain`}
        />
    );
}
