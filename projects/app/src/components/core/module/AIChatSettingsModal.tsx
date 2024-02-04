import React, { useMemo, useState } from 'react';
import MyModal from '@/components/MyModal';
import { useTranslation } from 'next-i18next';
import { useForm } from 'react-hook-form';
import {
  Box,
  BoxProps,
  Button,
  Flex,
  Link,
  ModalBody,
  ModalFooter,
  Switch
} from '@chakra-ui/react';
import MyTooltip from '@/components/MyTooltip';
import { QuestionOutlineIcon } from '@chakra-ui/icons';
import { Prompt_QuotePromptList, Prompt_QuoteTemplateList } from '@/global/core/prompt/AIChat';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import MySlider from '@/components/Slider';
import { ModuleInputKeyEnum } from '@fastgpt/global/core/module/constants';
import dynamic from 'next/dynamic';
import { PromptTemplateItem } from '@fastgpt/global/core/ai/type.d';
import type { AIChatModuleProps } from '@fastgpt/global/core/module/node/type.d';
import type { AppSimpleEditConfigTemplateType } from '@fastgpt/global/core/app/type.d';
import { SimpleModeTemplate_FastGPT_Universal } from '@/global/core/app/constants';
import { getDocPath } from '@/web/common/system/doc';
import PromptEditor from '@fastgpt/web/components/common/Textarea/PromptEditor';
import { EditorVariablePickerType } from '@fastgpt/web/components/common/Textarea/PromptEditor/type';

const PromptTemplate = dynamic(() => import('@/components/PromptTemplate'));

const AIChatSettingsModal = ({
  isAdEdit,
  onClose,
  onSuccess,
  defaultData,
  pickerMenu = []
}: {
  isAdEdit?: boolean;
  onClose: () => void;
  onSuccess: (e: AIChatModuleProps) => void;
  defaultData: AIChatModuleProps;
  pickerMenu?: EditorVariablePickerType[];
}) => {
  const { t } = useTranslation();
  const [refresh, setRefresh] = useState(false);
  const { feConfigs, llmModelList } = useSystemStore();

  const { handleSubmit, getValues, setValue, watch } = useForm({
    defaultValues: defaultData
  });
  const aiChatQuoteTemplate = watch(ModuleInputKeyEnum.aiChatQuoteTemplate);
  const aiChatQuotePrompt = watch(ModuleInputKeyEnum.aiChatQuotePrompt);

  const [selectTemplateData, setSelectTemplateData] = useState<{
    title: string;
    templates: PromptTemplateItem[];
  }>();

  const tokenLimit = useMemo(() => {
    return (
      llmModelList.find((item) => item.model === getValues(ModuleInputKeyEnum.aiModel))
        ?.maxResponse || 4000
    );
  }, [getValues, llmModelList]);

  const quoteTemplateVariables = (() => [
    {
      key: 'q',
      label: 'q',
      icon: 'core/app/simpleMode/variable'
    },
    {
      key: 'a',
      label: 'a',
      icon: 'core/app/simpleMode/variable'
    },
    {
      key: 'source',
      label: t('core.dataset.search.Source name'),
      icon: 'core/app/simpleMode/variable'
    },
    {
      key: 'sourceId',
      label: t('core.dataset.search.Source id'),
      icon: 'core/app/simpleMode/variable'
    },
    {
      key: 'index',
      label: t('core.dataset.search.Quote index'),
      icon: 'core/app/simpleMode/variable'
    },
    ...pickerMenu
  ])();
  const quotePromptVariables = (() => [
    {
      key: 'quote',
      label: t('core.app.Quote templates'),
      icon: 'core/app/simpleMode/variable'
    },
    {
      key: 'question',
      label: t('core.module.input.label.user question'),
      icon: 'core/app/simpleMode/variable'
    },
    ...pickerMenu
  ])();

  const LabelStyles: BoxProps = {
    fontSize: ['sm', 'md']
  };
  const selectTemplateBtn: BoxProps = {
    color: 'primary.500',
    cursor: 'pointer'
  };

  return (
    <MyModal
      isOpen
      iconSrc="/imgs/module/AI.png"
      title={
        <>
          {t('common.More settings')}
          {feConfigs?.docUrl && (
            <Link
              href={getDocPath('/docs/use-cases/ai_settings/')}
              target={'_blank'}
              ml={1}
              textDecoration={'underline'}
              fontWeight={'normal'}
              fontSize={'md'}
            >
              {t('common.Read intro')}
            </Link>
          )}
        </>
      }
      isCentered
      w={'700px'}
      h={['90vh', 'auto']}
    >
      <ModalBody flex={['1 0 0', 'auto']} overflowY={'auto'} minH={'40vh'}>
        {isAdEdit && (
          <Flex alignItems={'center'}>
            <Box {...LabelStyles} w={'80px'}>
              {t('core.app.Ai response')}
            </Box>
            <Box flex={1} ml={'10px'}>
              <Switch
                isChecked={getValues(ModuleInputKeyEnum.aiChatIsResponseText)}
                size={'lg'}
                onChange={(e) => {
                  const value = e.target.checked;
                  setValue(ModuleInputKeyEnum.aiChatIsResponseText, value);
                  setRefresh((state) => !state);
                }}
              />
            </Box>
          </Flex>
        )}
        <Flex mb={10} mt={isAdEdit ? 8 : 6}>
          <Box {...LabelStyles} mr={2} w={'80px'}>
            {t('core.app.Temperature')}
          </Box>
          <Box flex={1} ml={'10px'}>
            <MySlider
              markList={[
                { label: t('core.app.deterministic'), value: 0 },
                { label: t('core.app.Random'), value: 10 }
              ]}
              width={'95%'}
              min={0}
              max={10}
              value={getValues(ModuleInputKeyEnum.aiChatTemperature)}
              onChange={(e) => {
                setValue(ModuleInputKeyEnum.aiChatTemperature, e);
                setRefresh(!refresh);
              }}
            />
          </Box>
        </Flex>
        <Flex mt={5} mb={5}>
          <Box {...LabelStyles} mr={2} w={'80px'}>
            {t('core.app.Max tokens')}
          </Box>
          <Box flex={1} ml={'10px'}>
            <MySlider
              markList={[
                { label: '100', value: 100 },
                { label: `${tokenLimit}`, value: tokenLimit }
              ]}
              width={'95%'}
              min={100}
              max={tokenLimit}
              step={50}
              value={getValues(ModuleInputKeyEnum.aiChatMaxToken)}
              onChange={(val) => {
                setValue(ModuleInputKeyEnum.aiChatMaxToken, val);
                setRefresh(!refresh);
              }}
            />
          </Box>
        </Flex>

        <Box>
          <Flex {...LabelStyles} mb={1}>
            {t('core.app.Quote templates')}
            <MyTooltip
              label={t('template.Quote Content Tip', {
                default: Prompt_QuoteTemplateList[0].value
              })}
              forceShow
            >
              <QuestionOutlineIcon display={['none', 'inline']} ml={1} />
            </MyTooltip>
            <Box flex={1} />
            <Box
              {...selectTemplateBtn}
              onClick={() =>
                setSelectTemplateData({
                  title: t('core.app.Select quote template'),
                  templates: Prompt_QuoteTemplateList
                })
              }
            >
              {t('common.Select template')}
            </Box>
          </Flex>

          <PromptEditor
            variables={quoteTemplateVariables}
            h={160}
            title={t('core.app.Quote templates')}
            placeholder={t('template.Quote Content Tip', {
              default: Prompt_QuoteTemplateList[0].value
            })}
            value={aiChatQuoteTemplate}
            onChange={(e) => {
              setValue(ModuleInputKeyEnum.aiChatQuoteTemplate, e);
              // setRefresh(!refresh);
            }}
          />
        </Box>
        <Box mt={4}>
          <Flex {...LabelStyles} mb={1}>
            {t('core.app.Quote prompt')}
            <MyTooltip
              label={t('template.Quote Prompt Tip', { default: Prompt_QuotePromptList[0].value })}
              forceShow
            >
              <QuestionOutlineIcon display={['none', 'inline']} ml={1} />
            </MyTooltip>
          </Flex>
          <PromptEditor
            variables={quotePromptVariables}
            title={t('core.app.Quote prompt')}
            h={230}
            placeholder={t('template.Quote Prompt Tip', {
              default: Prompt_QuotePromptList[0].value
            })}
            value={aiChatQuotePrompt}
            onChange={(e) => {
              setValue(ModuleInputKeyEnum.aiChatQuotePrompt, e);
            }}
          />
        </Box>
      </ModalBody>
      <ModalFooter>
        <Button variant={'whiteBase'} onClick={onClose}>
          {t('common.Close')}
        </Button>
        <Button ml={4} onClick={handleSubmit(onSuccess)}>
          {t('common.Confirm')}
        </Button>
      </ModalFooter>
      {!!selectTemplateData && (
        <PromptTemplate
          title={selectTemplateData.title}
          templates={selectTemplateData.templates}
          onClose={() => setSelectTemplateData(undefined)}
          onSuccess={(e) => {
            const quoteVal = e.value;
            const promptVal = Prompt_QuotePromptList.find((item) => item.title === e.title)?.value;
            setValue(ModuleInputKeyEnum.aiChatQuoteTemplate, quoteVal);
            setValue(ModuleInputKeyEnum.aiChatQuotePrompt, promptVal);
          }}
        />
      )}
    </MyModal>
  );
};

export default AIChatSettingsModal;
