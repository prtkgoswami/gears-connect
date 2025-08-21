import React from "react";
import Profile from "./Profile";

type AccountParams = {
    params: Promise<{
        uid: string;
    }>
}

const Account = ({ params }: AccountParams) => {
    const unwrappedParams = React.use(params);
    const queryUid = unwrappedParams.uid
    const userId = queryUid;

    return (
        <Profile uid={userId} />
    )
}

export default Account;