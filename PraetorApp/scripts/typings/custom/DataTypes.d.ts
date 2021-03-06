﻿/**
 * This module is used to house interfaces describing server-side data types
 * that are used on the client-side (eg as parameters or responses to/from
 * AJAX calls).
 */
declare module PraetorApp.DataTypes {

    interface TokenResponse {
        expires: number;
        token: string;
    }
}
