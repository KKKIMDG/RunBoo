
import React, { FC } from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    View,
    TouchableOpacityProps,
    StyleProp,
    ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme'; // Assuming Colors is a complete theme object

interface ActionButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'secondary';
    icon?: keyof typeof Ionicons.glyphMap;
    style?: StyleProp<ViewStyle>;
    theme: typeof Colors.light | typeof Colors.dark;
}

const ActionButton: FC<ActionButtonProps> = ({
    title,
    variant = 'primary',
    icon,
    style,
    theme,
    ...props
}) => {
    const styles = getStyles(theme);
    const containerStyle = [
        styles.button,
        variant === 'primary' ? styles.primaryButton : styles.secondaryButton,
        props.disabled && styles.disabledButton,
        style,
    ];

    const textStyle = [
        styles.buttonText,
        variant === 'primary' ? styles.whiteText : styles.blackText,
    ];

    const iconColor = variant === 'primary' ? theme.card : theme.text;

    return (
        <TouchableOpacity style={containerStyle} activeOpacity={0.8} {...props}>
            {icon && <Ionicons name={icon} size={22} color={iconColor} />}
            <Text style={textStyle}>{title}</Text>
        </TouchableOpacity>
    );
};

const getStyles = (theme: typeof Colors.light | typeof Colors.dark) => StyleSheet.create({
    button: {
        width: '100%',
        height: 60,
        borderRadius: 18,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    primaryButton: {
        backgroundColor: theme.text,
    },
    secondaryButton: {
        backgroundColor: theme.card,
        borderWidth: 1.5,
        borderColor: theme.secondaryBackground,
    },
    disabledButton: {
        backgroundColor: '#D1D5DB', // A neutral gray for disabled state
    },
    buttonText: {
        fontSize: 17,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    whiteText: {
        color: theme.card,
    },
    blackText: {
        color: theme.text,
    },
});

export default ActionButton;
