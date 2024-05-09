"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";

import {
  Button,
  Center,
  ColorInput,
  RangeSlider,
  Grid,
  Group,
  Loader,
  Modal,
  rem,
  Stack,
  Stepper as StepperMantine,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { YearPickerInput } from "@mantine/dates";
import { FileWithPath, MIME_TYPES } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import {
  IconCircleCheck,
  IconFileTypeCsv,
  IconFolder,
  IconPhoto,
  IconAdjustments,
} from "@tabler/icons-react";

import Dropzone from "../Dropzone";
import Fancybox from "../Fancybox";
import SummaryTable from "../SummaryTable";
import classes from "./Stepper.module.css";

type ClazzData = {
  schoolYear: Date | null;
  clazzName: string;
  folderColor: string;
  students: Array<string>;
  photos: Array<File>;
  studentsWithPhotos: Array<{
    name: string;
    photo: FileWithPath;
    isPhotoValid: boolean;
    preview: React.ReactElement;
  }>;
};

enum ModalType {
  ConfirmUpload,
  Error,
}

type StateAndHandlers = {
  active: number;
  hasValidationBeenDone: boolean;
  setActive: React.Dispatch<React.SetStateAction<number>>;
  nextStep: () => void;
  prevStep: () => void;
  clazzData: ClazzData;
  faceHeightRange: [number, number];
  faceWidthRange: [number, number];
  eyeHeightRange: [number, number];
  eyeWidthRange: [number, number];
  setFaceHeightRange: (range: [number, number]) => void;
  setFaceWidthRange: (range: [number, number]) => void;
  setEyeHeightRange: (range: [number, number]) => void;
  setEyeWidthRange: (range: [number, number]) => void;
  clazzesInSelectedSchoolYear: string[];
  arePhotosResizing: boolean;
  arePhotosValidating: boolean;
  handlePickYearChange: (date: Date | null) => void;
  handleClazzNameChange: (n: string) => void;
  handleFolderColorChange: (color: string) => void;
  handleCSVUpload: (files: File) => void;
  handleResizePhotos: (files: FileWithPath[]) => void;
  handleValidatePhotos: () => void;
  handleDeleteStudent: (index: number) => void;
  handleClazzDataSubmission: () => void;
};

type StepperProps = {
  stateAndHandlers: StateAndHandlers;
};

const Stepper: React.FC<StepperProps> = ({ stateAndHandlers }) => {
  const locale = useLocale();
  const t = useTranslations("Stepper");
  const theme = useMantineTheme();
  const isMobile = useMediaQuery("(max-width: 52em)");
  const mimeTypesCSV = [MIME_TYPES.csv];
  const mimeTypesPhotos = [MIME_TYPES.jpeg];

  const nextStepButtonRef: React.RefObject<HTMLButtonElement> = useRef(null);

  const [modalType, setModalType] = useState<ModalType | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const {
    active,
    hasValidationBeenDone,
    setActive,
    nextStep,
    prevStep,
    clazzData,
    faceHeightRange,
    faceWidthRange,
    eyeHeightRange,
    eyeWidthRange,
    setFaceHeightRange,
    setFaceWidthRange,
    setEyeHeightRange,
    setEyeWidthRange,
    clazzesInSelectedSchoolYear,
    arePhotosResizing,
    arePhotosValidating,
    handlePickYearChange,
    handleClazzNameChange,
    handleFolderColorChange,
    handleCSVUpload,
    handleResizePhotos,
    handleValidatePhotos,
    handleDeleteStudent,
    handleClazzDataSubmission,
  } = stateAndHandlers;

  const marks = [{ value: 25 }, { value: 50 }, { value: 75 }];

  const form = useForm({
    initialValues: {
      schoolYear: clazzData.schoolYear,
      clazzName: clazzData.clazzName,
    },
    validate: {
      schoolYear: (value) =>
        value && value.getFullYear() <= new Date().getFullYear()
          ? null
          : t("form.schoolYear.errorMessage"),
      clazzName: (value) =>
        value.trim() ? null : t("form.clazzName.errorMessage"),
    },
    validateInputOnChange: true,
  });

  useEffect(() => {
    if (active === 0) {
      const isFormValid: boolean =
        clazzData.schoolYear &&
        clazzData.schoolYear.getFullYear() <= new Date().getFullYear() &&
        clazzData.clazzName.trim() !== "" &&
        clazzData.folderColor !== ""
          ? true
          : false;
      if (nextStepButtonRef.current) {
        nextStepButtonRef.current.disabled = !isFormValid;
      }
    } else if (active === 1) {
      const isFormValid: boolean = clazzData.students.length > 0;
      if (nextStepButtonRef.current) {
        nextStepButtonRef.current.disabled = !isFormValid;
      }
    } else if (active === 2) {
      const isFormValid: boolean = clazzData.photos.length > 0;
      if (nextStepButtonRef.current) {
        nextStepButtonRef.current.disabled = !isFormValid;
      }
    } else if (active === 3) {
      const hasAlreadyBeenValidated: boolean = hasValidationBeenDone;
      if (nextStepButtonRef.current) {
        nextStepButtonRef.current.disabled = !hasAlreadyBeenValidated;
      }
    }
  }, [active, clazzData]);

  const openModal = () => {
    if (
      clazzData.students.length !== 0 &&
      clazzData.photos.length !== 0 &&
      clazzData.students.length === clazzData.photos.length
    ) {
      const hasInvalidPhoto = clazzData.studentsWithPhotos.some(
        (element) => !element.isPhotoValid
      );
      if (hasInvalidPhoto) {
        setModalType(ModalType.Error);
      } else {
        setModalType(ModalType.ConfirmUpload);
      }
      open();
    } else {
      setModalType(ModalType.Error);
      open();
    }
  };

  return (
    <>
      <StepperMantine
        active={active}
        onStepClick={setActive}
        allowNextStepsSelect={false}
        completedIcon={
          <IconCircleCheck style={{ width: rem(18), height: rem(18) }} />
        }
        w="100%"
        classNames={classes}
        orientation={isMobile ? "vertical" : "horizontal"}
      >
        <StepperMantine.Step
          icon={<IconFolder style={{ width: rem(18), height: rem(18) }} />}
          label={t("firstStep.label")}
          description={t("firstStep.description")}
        >
          <YearPickerInput
            mb={rem(16)}
            label={t("firstStep.schoolYearInput.label")}
            value={clazzData.schoolYear}
            onChange={(e) => {
              handlePickYearChange(e);
              form.setFieldValue("schoolYear", e);
            }}
            error={form.errors.schoolYear}
            required
          />
          <TextInput
            mb={rem(16)}
            label={t("firstStep.clazzNameInput.label")}
            placeholder={t("firstStep.clazzNameInput.placeholder")}
            value={clazzData.clazzName}
            onChange={(e) => {
              handleClazzNameChange(e.target.value);
              form.setFieldValue("clazzName", e.target.value);
            }}
            error={form.errors.clazzName}
            required
          />
          {!clazzesInSelectedSchoolYear.includes(clazzData.clazzName) && (
            <ColorInput
              label={t("firstStep.colorInput.label")}
              format="hex"
              swatches={[
                "#fcbc19",
                "#4154fa",
                "#429fe3",
                "#e34242",
                "#3cab68",
                "#e3a342",
                "#9c42e3",
                "#436a68",
              ]}
              swatchesPerRow={8}
              defaultValue={clazzData.folderColor}
              onChange={(color) => handleFolderColorChange(color)}
              disallowInput
              required
            />
          )}
        </StepperMantine.Step>

        <StepperMantine.Step
          icon={<IconFileTypeCsv style={{ width: rem(18), height: rem(18) }} />}
          label={t("secondStep.label")}
          description={t("secondStep.description")}
        >
          <Dropzone
            acceptedMimeTypes={mimeTypesCSV}
            maxSize={2}
            multiple={false}
            idle={t("secondStep.dropzone.idle")}
            typesString={[".csv"]}
            handleCSVUpload={handleCSVUpload}
            nextStepButtonRef={nextStepButtonRef}
          />
          {clazzData.students.length > 0 && (
            <Stack mt={rem(48)}>
              {clazzData.students.map((student) => {
                return (
                  <Center>
                    <Text>{student}</Text>
                  </Center>
                );
              })}
            </Stack>
          )}
        </StepperMantine.Step>

        <StepperMantine.Step
          icon={<IconPhoto style={{ width: rem(18), height: rem(18) }} />}
          label={t("thirdStep.label")}
          description={t("thirdStep.description")}
        >
          <Dropzone
            acceptedMimeTypes={mimeTypesPhotos}
            maxSize={300}
            multiple={true}
            idle={t("thirdStep.dropzone.idle")}
            typesString={[".jpeg"]}
            handleResizePhotos={handleResizePhotos}
            nextStepButtonRef={nextStepButtonRef}
          />
          {arePhotosResizing !== true && clazzData.photos.length > 0 && (
            <Fancybox
              options={{
                Carousel: {
                  infinite: false,
                },
              }}
            >
              <Grid mt={rem(48)}>
                {clazzData.studentsWithPhotos.map((s) => (
                  <Grid.Col
                    span={{ base: 6, xs: 3, sm: 2.4, md: 2, lg: 1.5 }}
                    key={uuid()}
                  >
                    {s.preview}
                  </Grid.Col>
                ))}
              </Grid>
            </Fancybox>
          )}
        </StepperMantine.Step>

        <StepperMantine.Step
          icon={<IconAdjustments style={{ width: rem(18), height: rem(18) }} />}
          label={t("fourthStep.label")}
          description={t("fourthStep.description")}
        >
          <Text size="sm" mt="xl" mb={6} ta="right">{`${t(
            "fourthStep.faceHeightRange"
          )} (${faceHeightRange[0]} % - ${faceHeightRange[1]} %)`}</Text>
          <RangeSlider
            minRange={5}
            min={0}
            max={100}
            step={1}
            defaultValue={faceHeightRange}
            marks={marks}
            label={null}
            onChange={(e) => setFaceHeightRange(e)}
          />

          <Text size="sm" mt="xl" mb={6} ta="right">{`${t(
            "fourthStep.faceWidthRange"
          )} (${faceWidthRange[0]} % - ${faceWidthRange[1]} %)`}</Text>
          <RangeSlider
            minRange={5}
            min={0}
            max={100}
            step={1}
            defaultValue={faceWidthRange}
            marks={marks}
            label={null}
            onChange={(e) => setFaceWidthRange(e)}
          />

          <Text size="sm" mt="xl" mb={6} ta="right">{`${t(
            "fourthStep.eyeHeightRange"
          )} (${eyeHeightRange[0]} % - ${eyeHeightRange[1]} %)`}</Text>
          <RangeSlider
            minRange={2}
            min={0}
            max={100}
            step={1}
            defaultValue={eyeHeightRange}
            marks={marks}
            label={null}
            onChange={(e) => setEyeHeightRange(e)}
          />

          <Text size="sm" mt="xl" mb={6} ta="right">{`${t(
            "fourthStep.eyeWidthRange"
          )} (${eyeWidthRange[0]} % - ${eyeWidthRange[1]} %)`}</Text>
          <RangeSlider
            minRange={2}
            min={0}
            max={100}
            step={1}
            defaultValue={eyeWidthRange}
            marks={marks}
            label={null}
            onChange={(e) => setEyeWidthRange(e)}
          />
        </StepperMantine.Step>
        <StepperMantine.Completed>
          <Title order={1} ta="center">
            {t("completed.title")}
          </Title>
          <Text
            ta="center"
            mb="xl"
          >{`${clazzData.schoolYear?.getFullYear()} – ${
            clazzData.clazzName
          }`}</Text>
          <SummaryTable
            studentsWithPhotos={clazzData.studentsWithPhotos}
            handleDeleteStudent={handleDeleteStudent}
          />
        </StepperMantine.Completed>
      </StepperMantine>

      <Group justify="center" mt="xl">
        <Button variant="default" onClick={prevStep}>
          {t("navigation.back")}
        </Button>
        {active === 3 && (
          <Button onClick={handleValidatePhotos}>
            {t("navigation.validate")}
          </Button>
        )}
        {active === 4 ? (
          <Button onClick={openModal}>{t("navigation.submit")}</Button>
        ) : (
          <Button ref={nextStepButtonRef} onClick={nextStep}>
            {t("navigation.next")}
          </Button>
        )}
      </Group>

      <Modal
        zIndex={1000}
        opened={arePhotosResizing}
        onClose={() => {}}
        withCloseButton={false}
        closeOnClickOutside={false}
        closeOnEscape={false}
      >
        <Center>
          <Loader color={theme.colors.pslib[6]} size="md" mb="sm" />
        </Center>
        <Text ta="center" className={classes.loading}>
          {t("modal.rezizing")}
        </Text>
      </Modal>

      <Modal
        zIndex={1000}
        opened={arePhotosValidating}
        onClose={() => {}}
        withCloseButton={false}
        closeOnClickOutside={false}
        closeOnEscape={false}
      >
        <Center>
          <Loader color={theme.colors.pslib[6]} size="md" mb="sm" />
        </Center>
        <Text ta="center" className={classes.loading}>
          {t("modal.validating")}
        </Text>
      </Modal>

      <Modal
        opened={opened}
        onClose={close}
        title={
          modalType === ModalType.ConfirmUpload
            ? t("modal.submit.valid.title")
            : t("modal.submit.error.title")
        }
        centered
        radius="md"
        zIndex={1000}
      >
        {modalType === ModalType.ConfirmUpload ? (
          <>
            {t("modal.submit.valid.text")}
            <Group justify="center" mt="xl">
              <Button variant="default" onClick={close}>
                {t("modal.submit.valid.leftButton")}
              </Button>
              <Button onClick={handleClazzDataSubmission}>
                {t("modal.submit.valid.rightButton")}
              </Button>
            </Group>
          </>
        ) : (
          <>
            {t("modal.submit.error.text")}
            <Group justify="center" mt="xl">
              <Button color="red" onClick={close}>
                {t("modal.submit.error.tryAgainButton")}
              </Button>
            </Group>
          </>
        )}
      </Modal>
    </>
  );
};

export default Stepper;
