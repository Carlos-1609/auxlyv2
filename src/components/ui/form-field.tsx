import { useId, useState, type Ref } from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { colors } from '@/constants/theme';

type FormFieldProps = TextInputProps & {
  label: string;
  error?: string;
  hint?: string;
  password?: boolean;
  inputRef?: Ref<TextInput>;
};

export function FormField({ label, error, hint, password, inputRef, ...props }: FormFieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <View className="gap-2">
      <Text nativeID={`${id}-label`} className="text-sm font-semibold text-foreground">{label}</Text>
      <View className={`min-h-14 flex-row items-center rounded-2xl border bg-surface ${error ? 'border-error' : 'border-border'}`}>
        <TextInput
          {...props}
          ref={inputRef}
          accessibilityLabel={label}
          aria-labelledby={`${id}-label`}
          aria-describedby={error || hint ? `${id}-hint` : undefined}
          aria-invalid={Boolean(error)}
          className="min-h-14 min-w-0 flex-1 px-4 py-3 text-base text-foreground"
          placeholderTextColor={colors.muted}
          selectionColor={colors.primary}
          secureTextEntry={Boolean(password && !visible)}
          autoCorrect={false}
          autoCapitalize={props.autoCapitalize ?? 'none'}
        />
        {password && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
            onPress={() => setVisible((current) => !current)}
            disabled={props.editable === false}
            className="min-h-12 min-w-12 items-center justify-center"
          >
            <Icon name={visible ? 'eye-off' : 'eye'} size={19} color={colors.muted} />
          </Pressable>
        )}
      </View>
      {(error || hint) && (
        <Text
          nativeID={`${id}-hint`}
          accessibilityLiveRegion={error ? 'polite' : 'none'}
          className={`text-xs leading-5 ${error ? 'text-error' : 'text-muted'}`}
        >
          {error || hint}
        </Text>
      )}
    </View>
  );
}
