import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { RFValue } from 'react-native-responsive-fontsize';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

import { Header } from '../../components/Header';
import { Input } from '../../components/Form/Input';
import { Button } from '../../components/Form/Button';

import {
  Container,
  Form
} from './styles';
import { StackNavigationProp } from '@react-navigation/stack';

interface FormData {
  id: string;
  service_name: string;
  email: string;
  password: string;
}

const schema = Yup.object().shape({
  service_name: Yup.string().required('Nome do serviço é obrigatório!'),
  email: Yup.string().email('Não é um email válido').required('Email é obrigatório!'),
  password: Yup.string().required('Senha é obrigatória!'),
})

type RootStackParamList = {
  Home: undefined;
  RegisterLoginData: undefined;
};

type NavigationProps = StackNavigationProp<RootStackParamList, 'RegisterLoginData'>;

export function RegisterLoginData() {
  const { navigate } = useNavigation<NavigationProps>();
  const dataKey = '@savepass:logins';

  const {
    control,
    formState: {
      errors
    },
    handleSubmit,
  } = useForm({
    resolver: yupResolver(schema)
  });

  async function handleRegister(formData: FormData[]) {
    let dataKeys: FormData[] = []
    const existingKeys = await AsyncStorage.getItem(dataKey);
    const newLoginData = {
      id: String(uuid.v4()),
      ...formData
    }

    if (existingKeys === null) {
      dataKeys.push(newLoginData as any)
      const newLoginDataFormatted = JSON.stringify(dataKeys)
      await AsyncStorage.setItem(dataKey, newLoginDataFormatted);
      navigate("Home")
    } else {
      const existingKeysFormatted: FormData[] = JSON.parse(existingKeys);
      dataKeys = [...existingKeysFormatted];
      dataKeys.push(newLoginData as any);
      const allKeysFormatted = JSON.stringify(dataKeys);

      await AsyncStorage.setItem(dataKey, allKeysFormatted);
      navigate("Home")
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      enabled
    >
      <Header />
      <Container>
        <Form>
          <Input
            testID="service-name-input"
            title="Nome do serviço"
            name="service_name"
            error={errors?.service_name && errors.service_name.message}
            control={control}
            autoCapitalize="sentences"
            autoCorrect
          />
          <Input
            testID="email-input"
            title="E-mail ou usuário"
            name="email"
            error={errors?.email && errors.email.message}
            control={control}
            autoCorrect={false}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input
            testID="password-input"
            title="Senha"
            name="password"
            error={errors?.password && errors.password.message}
            control={control}
            secureTextEntry
          />

          <Button
            style={{
              marginTop: RFValue(8)
            }}
            title="Salvar"
            onPress={handleSubmit(handleRegister as SubmitHandler<FieldValues>)}
          />
        </Form>
      </Container>
    </KeyboardAvoidingView>
  )
}