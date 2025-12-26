
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, TextInputProps } from 'react-native';
import { getStyles } from './FormField.styles';
import { Colors } from '@/constants/theme';

interface FormFieldProps extends TextInputProps {
    label: string;
    containerStyle?: object;
    scheme: 'light' | 'dark';
}

export const FormField: React.FC<FormFieldProps> = ({ label, containerStyle, scheme, ...props }) => {
    const styles = getStyles(scheme);
    const colors = Colors[scheme];
    return (
        <View style={[styles.inputGroup, containerStyle]}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputBox}>
                <TextInput
                    style={styles.textInputBox}
                    placeholderTextColor={colors.icon}
                    {...props}
                />
            </View>
        </View>
    );
};

interface InlineFormFieldProps extends TextInputProps {
    label: string;
    buttonText: string;
    onButtonPress: () => void;
    buttonDisabled?: boolean;
    scheme: 'light' | 'dark';
}

export const InlineFormField: React.FC<InlineFormFieldProps> = ({
    label,
    buttonText,
    onButtonPress,
    buttonDisabled,
    scheme,
    ...props
}) => {
    const styles = getStyles(scheme);
    const colors = Colors[scheme];
    return (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inlineInputBox}>
                <TextInput
                    style={styles.textInput}
                    placeholderTextColor={colors.icon}
                    {...props}
                />
                <TouchableOpacity
                    style={styles.inlineButton}
                    onPress={onButtonPress}
                    disabled={buttonDisabled}
                    activeOpacity={0.7}
                >
                    <Text style={styles.inlineButtonText}>{buttonText}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
