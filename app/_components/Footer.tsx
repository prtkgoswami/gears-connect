"use client"
import { usePathname } from "next/navigation";
import { APP_NAME } from "../constants/variables";

const Footer = () => {

    const pathname = usePathname();
    const shouldNotShowFooter = ['/'].includes(pathname);

    if (shouldNotShowFooter) {
        return <></>
    }

    return (
        <footer className="py-8 xl:py-12 px-8 bg-slate-900 border-t border-slate-700">
            <div className="max-w-6xl mx-auto text-center">
                <div className="text-slate-300 text-sm xl:text-base mb-3 xl:mb-5">Made with passion for Gearheads</div>
                <p className="text-slate-400 text-xs xl:text-base">
                    {`© 2024 ${APP_NAME}. All rights reserved.`}
                </p>
            </div>
        </footer>
    )
}

export default Footer;