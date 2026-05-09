export default function ApplicationLogo({ className = '', type = 'icon', ...props }) {
    return (
        <img
            {...props}
            src={type === 'logo' ? "/images/logo.png" : "/images/icon.png"}
            alt="JobAlign Book"
            className={`${className} object-contain`}
        />
    );
}
