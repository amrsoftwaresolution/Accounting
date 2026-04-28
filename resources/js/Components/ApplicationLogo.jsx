export default function ApplicationLogo({ className = '', ...props }) {
    return (
        <img
            {...props}
            src="/images/icon.png"
            alt="Logo"
            className={`${className} object-contain`}
        />
    );
}
