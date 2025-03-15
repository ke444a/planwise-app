export default {
    expo: {
        name: "planwise-app",
        slug: "planwise-app",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./src/assets/icon.png",
        userInterfaceStyle: "light",
        newArchEnabled: true,
        scheme: "planwise-app",
        splash: {
            image: "./src/assets/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff"
        },
        ios: {
            supportsTablet: true,
            bundleIdentifier: "com.planwise.app",
            googleServicesFile: process.env.GOOGLE_SERVICES_INFOPLIST ?? "./GoogleService-Info.plist"
        },
        android: {
            package: "com.planwise.app",
            adaptiveIcon: {
                foregroundImage: "./src/assets/adaptive-icon.png",
                backgroundColor: "#ffffff"
            }
        },
        web: {
            favicon: "./src/assets/favicon.png",
            bundler: "metro"
        },
        plugins: [
            "expo-router",
            "@react-native-google-signin/google-signin",
            "@react-native-firebase/app",
            "@react-native-firebase/auth",
            [
                "expo-build-properties",
                {
                    "ios": {
                        "useFrameworks": "static"
                    }
                }
            ]
        ],
        extra: {
            eas: {
                projectId: "99dbc5eb-8bcc-4e25-ad35-32ac4f37d576"
            }
        }
    }
};
